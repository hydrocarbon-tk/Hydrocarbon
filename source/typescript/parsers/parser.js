import {ParserFactory} from "@candlefw/hydrocarbon"; 

const data = (()=>{
        
    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [123,125,58,40,41,44,91,93,59,61,46,92,34,95,36,103,58,105,100,47,42,47,105,110,116,101,103,101,114,110,117,108,108,99,108,115,116,114,105,110,103,102,108,111,97,116,101,120,112,111,114,116,109,97,116,99,104,98,114,101,97,107,117,110,115,105,103,110,101,100,56,49,50,56,51,50,54,52,116,114,117,101,112,114,105,118,47,47,105,109,112,111,114,116,102,97,108,115,101,108,115,101,109,117,116,117,105,110,116,49,54,112,117,98,105,109,117,116,105,115,105,102,108,116,102,110,102,112];
    const TokenSpace = 2;
    const TokenNumber = 5;
    const TokenIdentifier = 1;
    const TokenNewLine = 4;
    const TokenSymbol = 0;
    const UNICODE_ID_START = 16;
    const UNICODE_ID_CONTINUE = 32;

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

    function utf8ToCodePoint(l, data) {

        let buffer = data.input;

        let index = l.byte_offset + l.byte_length;

        const a = buffer[index];
    
        let flag = 0xE;
    
        if (a & 0x80) {
    
            flag = a & 0xF0;
    
            const b = buffer[index+1];
    
            if (flag & 0xE0) {
    
                flag = a & 0xF8;
    
                const c = buffer[index+2];
    
                if (flag == 0xF0){
                    l.byte_length += 3;
                    return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index+3] & 0x3F);
                }
    
                else if (flag == 0xE0){
                    l.byte_length += 2;
                    return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
                }
    
            } else if (flag == 0xC) {
                l.byte_length += 1;
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
        return 0;
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

        getType(USE_UNICODE, data){
            if(this.type == 0){
                if( !USE_UNICODE || this.current_byte < 128){
                    this.type = getTypeAt(this.current_byte);
                } else {
                    let index = this.byte_offset;
                    this.type = getTypeAt(utf8ToCodePoint(this, data));
                }
            }
            return this.type;
        }

        
        isSym(USE_UNICODE, data) {
            return this.getType(USE_UNICODE, data) == TokenSymbol;
        }
        
        isNL() {
            return this.current_byte == 10 || this.current_byte == 13;
        }
        
        isSP(USE_UNICODE, data) {
            return this.current_byte == 32 || USE_UNICODE && TokenSpace == this.getType(USE_UNICODE, data);
        }

        isNum(data) {
            if(this.getType(false, data) == TokenNumber){
                
                const l = data.input_len;
                
                let off = this.byte_offset;
                
                let prev_byte_len = this.byte_length;
                
                while ((off < l) && 47 < data.input[off]  &&  data.input[off++] < 58 ) {
                    this.byte_length++;
                    this.token_length++;
                }

                return true;
            }

            return false;
        }

        isUniID(data){
            if(this.getType(true, data) == TokenIdentifier){
                
                const l = data.input_len;
                
                let off = this.byte_offset;
                
                let prev_byte_len = this.byte_length;
                
                while (((off + this.byte_length) < l) &&  ((UNICODE_ID_START|UNICODE_ID_CONTINUE) & lookup_table[utf8ToCodePoint(this, data)]) > 0) {
                    this.byte_length++;
                    prev_byte_len = this.byte_length;
                    this.token_length++;
                }

                this.byte_length = prev_byte_len;

                return true;
            }

            return false;
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

    function add_shift(l, data, tok_len) {
        
        const skip_delta = l.token_offset - l.prev_token_offset;

        let has_skip = skip_delta > 0, 
            has_len = tok_len > 0, 
            val = 1;
        
        val |= (skip_delta << 3);
        
        if (has_skip && ((skip_delta > 36863) || (tok_len > 36863))) {
            add_shift(l, data, 0);
            has_skip = 0;
            val = 1;
        }
        
        val |= (((has_skip << 2) | (has_len << 1)) | (tok_len << (3 + (15 * has_skip))));
        
        set_action(val, data);

        l.prev_token_offset = l.token_offset + l.token_length;
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


    function add_reduce(state, data,sym_len, body, DNP = false) {
        if (isOutputEnabled(state)) {
            set_action(((DNP << 1) | ((sym_len & 16383) << 2)) | (body << 16),data);
        }
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

    function assert_consume(l, data, state, accept) {

        if (hasStateFailed(state)) 
            return 0;
        
        if (accept) {
            consume(l, data, state);
            return state;
        } else {
            return 0;
        }
    }

    function assertSuccess(l, state, condition) {
        if (!condition || hasStateFailed(state)) 
            return fail(l, state);
        return state;
    }

    function run_parser(data, function_id){
        const lexer = {

        }
    }

    function remove_data(data){
        // Should delete data in a non garbage collected language
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

    function debug_add_item(data, item_index) { 
        data.debug[data.debug_ptr++] = item_index;
    }

    function init_table(){ return lookup_table;  }
    
    function init_data(input_len, rules_len, error_len, debug_len){

        let 
            input = new Uint8Array(input_len),
            rules = new Uint32Array(rules_len),
            error = new Uint8Array(error_len),
            debug = new Uint8Array(debug_len)

        return {
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
            debug: debug
        }
    }
    
    ;
function comment_tok_ec0f87e92b184da4(l,data){
    if(defined_token_ca4d0184b183b645(l,data)/*[/asterisk] [//]*/){
        let c = l.copy();
        if($comment(c,data,createState(0))){
            l.token_length = c.token_offset-l.token_offset;
            l.byte_length = c.byte_offset-l.byte_offset;
            return true;
        }
    }
    return false;
}
function defined_token_36355867e1260ecf(l,data){
    if(5==compare(data,l.byte_offset +0,41,5)){
        l.type = TokenSymbol;
        l.byte_length = 5;
        l.token_length = 5;
        return true;
    } else if(2==compare(data,l.byte_offset +0,126,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    }
    return true;
}
function defined_token_44988bc5e23c2dbb(l,data){
    if(4==compare(data,l.byte_offset +0,105,4)){
        l.type = TokenSymbol;
        l.byte_length = 4;
        l.token_length = 4;
        return true;
    } else if(8==compare(data,l.byte_offset +0,62,8)){
        l.type = TokenSymbol;
        l.byte_length = 8;
        l.token_length = 8;
        return true;
    }
    return true;
}
function defined_token_5eb825c2bea966aa(l,data){
    if(2==compare(data,l.byte_offset +0,109,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(3==compare(data,l.byte_offset +0,71,3)){
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    }
    return true;
}
function defined_token_76027f038238d69d(l,data){
    if(3==compare(data,l.byte_offset +0,35,3)){
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    }
    return true;
}
function defined_token_82c8039af910f43f(l,data){
    if(data.input[l.byte_offset + 0] == 91){
        /*[[]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            /*[if]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,53,4)){
            /*[match]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*[fn]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 3;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,96,3)){
                /*[false]symbol*/
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                return 7;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,58,4)){
            /*[break]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            return 4;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*[(]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 5;
    } else if(data.input[l.byte_offset + 0] == 123){
        /*[{]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 6;
    } else if(data.input[l.byte_offset + 0] == 34){
        /*["]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 7;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,79,3)){
            /*[true]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 7;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,30,3)){
            /*[null]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 7;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*[_]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 8;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*[$]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 8;
    }
    if(l.isNum(data)){
        return 7;
    } else if(l.isUniID(data)){
        return 8;
    }
}
function defined_token_890e635c95d9af32(l,data){
    if(3==compare(data,l.byte_offset +0,22,3)){
        if(4==compare(data,l.byte_offset +3,25,4)){
            l.type = TokenSymbol;
            l.byte_length = 7;
            l.token_length = 7;
            return true;
        }
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    }
    return true;
}
function defined_token_af967e86e8c7d4a8(l,data){
    if(data.input[l.byte_offset + 0] == 105){
        if(5==compare(data,l.byte_offset +1,89,5)){
            /*[import]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[[]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 99){
        if(2==compare(data,l.byte_offset +1,34,2)){
            /*[cls]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,36,2)){
            /*[str]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            return 3;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*[fn]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 4;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            /*[ns]symbol*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 5;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*[_]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 6;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*[$]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 6;
    }
    if(l.isUniID(data)){
        return 6;
    }
}
function defined_token_b42b030566ff279e(l,data){
    if(data.input[l.byte_offset + 0] == 61){
        /*[=]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 46){
        /*[.]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[[]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*[(]symbol*/
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    }
    if(l.isSym(true,data)){
        return 4;
    }
}
function defined_token_ca4d0184b183b645(l,data){
    if(2==compare(data,l.byte_offset +0,19,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,86,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    }
    return true;
}
function identifier_token_tok_c3af7d2e4e300f22(l,data){
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        let c = l.copy();
        if($identifier_token(c,data,createState(0))){
            l.token_length = c.token_offset-l.token_offset;
            l.byte_length = c.byte_offset-l.byte_offset;
            return true;
        }
    }
    return false;
}
function non_capture_222b6b2ad90aaec0(l){
    if(l.isSP(true,data)){
        l.token_length = 0;
        l.byte_length = 0;
        return true;
    }
    return false;
}
function non_capture_6c6329e8ba3f5e20(l){
    if(l.isNL()){
        l.token_length = 0;
        l.byte_length = 0;
        return true;
    }
    return false;
}
function sk_01ebdfddd6029592(l,data){
    while(1){
        if(!((comment_tok_ec0f87e92b184da4(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    return l;
}
function sk_03fa1f203f1dd7e8(l,data){
    while(1){
        if(!(comment_tok_ec0f87e92b184da4(l,data))){
            break;
        }
        l.next(data);
    }
    return l;
}
function sk_5bef380e54687dea(l,data){
    while(1){
        if(!(l.isNL()||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    return l;
}
function sk_abe0181f4c01660d(l,data){
    while(1){
        if(!(comment_tok_ec0f87e92b184da4(l,data)||l.isNL())){
            break;
        }
        l.next(data);
    }
    return l;
}
function sk_af14aaaa4a0a14a1(l,data){
    while(1){
        if(!(l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    return l;
}
function sk_ea7f40a22e099bd2(l,data){
    while(1){
        if(!((comment_tok_ec0f87e92b184da4(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    return l;
}
function string_tok_d22ac129e6fa2247(l,data){
    if(l.current_byte==34/*["]*/){
        let c = l.copy();
        if($string(c,data,createState(0))){
            l.token_length = c.token_offset-l.token_offset;
            l.byte_length = c.byte_offset-l.byte_offset;
            return true;
        }
    }
    return false;
}
/*production name: skribble
            grammar index: 0
            bodies:
	0:0 skribble=>• statements - 
            compile time: 5.845ms*/;
function $skribble(l,data,state){
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$statements(l,data,state)){
        /*--unique-id--0--DO-NOT-REPLACE*/
        return state;
    }
    return 0;
}
/*production name: statements
            grammar index: 1
            bodies:
	1:1 statements=>• import - 
		1:2 statements=>• class - 
		1:3 statements=>• primitive_declaration - 
		1:4 statements=>• struct - 
		1:5 statements=>• function - 
		1:6 statements=>• namespace - 
            compile time: 531.1ms*/;
function $statements(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    switch(defined_token_af967e86e8c7d4a8(l,data)){
        case 0:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$import(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
        case 1:
            /*peek_level:0 offset:0*/
            if(state=$modifier_list(l,data,state)){
                /*--unique-id--16--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,16);
            }
            break;
        case 2:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$class(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
        case 3:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$struct(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
        case 4:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$function(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
        case 5:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$namespace(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
        case 6:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$primitive_declaration(l,data,state)){
                /*--unique-id--1--DO-NOT-REPLACE*/
                return $statements_goto(l,data,state,1);
            }
            break;
    }
    return 0;
}
function $statements_goto(l,data,state,prod){
    while(1){
        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
        /*peek_level:0 offset:0 -- clause*/
        if(cmpr_set(l,data,33,3,3)/*[cls]*/){
            /*peek*/
            /*peek*/
            /*
               8:18 class=>modifier_list • cls identifier class_group_110_101 { class_HC_listbody1_103 }
               8:20 class=>modifier_list • cls identifier class_group_110_101 { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,33,3,3)/*[cls]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   8:18 class=>modifier_list cls • identifier class_group_110_101 { class_HC_listbody1_103 }
                   8:20 class=>modifier_list cls • identifier class_group_110_101 { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       8:18 class=>modifier_list cls • identifier class_group_110_101 { class_HC_listbody1_103 }
                       8:20 class=>modifier_list cls • identifier class_group_110_101 { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$class_group_110_101(l,data,state)){
                        /*assert*/
                        /*assert*/
                        /*
                           8:18 class=>modifier_list cls identifier • class_group_110_101 { class_HC_listbody1_103 }
                           8:20 class=>modifier_list cls identifier • class_group_110_101 { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                            /*consume*/
                            /*consume*/
                            /*
                               8:18 class=>modifier_list cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                               8:20 class=>modifier_list cls identifier class_group_110_101 { • }
                            */
                            /*peek_level:0 offset:7 -- clause*/
                            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(l.current_byte==125/*[}]*/){
                                /*assert*/
                                /*assert*/
                                /*
                                   8:20 class=>modifier_list cls identifier class_group_110_101 { • }
                                */
                                /*peek_level:-1 offset:7*/
                                /*---leaf-assert----*/
                                consume(l,data,state);
                                {
                                    /*--unique-id--1--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,0);
                                    prod = 1;
                                    continue;
                                }
                            } else {
                                /*peek-production-closure*/
                                /*peek-production-closure*/
                                /*
                                   8:18 class=>modifier_list cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                                */
                                /*peek_level:0 offset:7*/
                                /*---leaf-peek-production-closure----*/
                                if(state=$class_HC_listbody1_103(l,data,state)){
                                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                        /*--unique-id--1--DO-NOT-REPLACE*/
                                        add_reduce(state,data,7,0);
                                        prod = 1;
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if(cmpr_set(l,data,35,3,3)/*[str]*/){
            /*peek*/
            /*peek*/
            /*
               9:22 struct=>modifier_list • str identifier { arguments }
               9:24 struct=>modifier_list • str identifier { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,35,3,3)/*[str]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   9:22 struct=>modifier_list str • identifier { arguments }
                   9:24 struct=>modifier_list str • identifier { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       9:22 struct=>modifier_list str • identifier { arguments }
                       9:24 struct=>modifier_list str • identifier { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           9:22 struct=>modifier_list str identifier { • arguments }
                           9:24 struct=>modifier_list str identifier { • }
                        */
                        /*peek_level:0 offset:6 -- clause*/
                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(l.current_byte==125/*[}]*/){
                            /*assert*/
                            /*assert*/
                            /*
                               9:24 struct=>modifier_list str identifier { • }
                            */
                            /*peek_level:-1 offset:6*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                /*--unique-id--1--DO-NOT-REPLACE*/
                                add_reduce(state,data,5,7);
                                prod = 1;
                                continue;
                            }
                        } else {
                            /*peek-production-closure*/
                            /*peek-production-closure*/
                            /*
                               9:22 struct=>modifier_list str identifier { • arguments }
                            */
                            /*peek_level:0 offset:6*/
                            /*---leaf-peek-production-closure----*/
                            if(state=$arguments(l,data,state)){
                                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                    /*--unique-id--1--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,5);
                                    prod = 1;
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
            /*peek*/
            /*peek*/
            /*
               10:26 function=>modifier_list • fn identifier : type ( arguments ) { expression_statements }
               10:28 function=>modifier_list • fn identifier : type ( ) { expression_statements }
               10:29 function=>modifier_list • fn identifier : type ( arguments ) { }
               10:32 function=>modifier_list • fn identifier : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,124,2,2)/*[fn]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                   10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                   10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                   10:32 function=>modifier_list fn • identifier : type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                       10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                       10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                       10:32 function=>modifier_list fn • identifier : type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                           10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                           10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                           10:32 function=>modifier_list fn identifier : • type ( ) { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(state=$type(l,data,state)){
                            /*assert*/
                            /*assert*/
                            /*
                               10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                               10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                               10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                               10:32 function=>modifier_list fn identifier : • type ( ) { }
                            */
                            /*peek_level:-1 offset:7 -- clause*/
                            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                                /*consume*/
                                /*consume*/
                                /*
                                   10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                   10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                   10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                   10:32 function=>modifier_list fn identifier : type ( • ) { }
                                */
                                /*peek_level:0 offset:8 -- clause*/
                                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(l.current_byte==41/*[)]*/){
                                    /*peek*/
                                    /*peek*/
                                    /*
                                       10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                       10:32 function=>modifier_list fn identifier : type ( • ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           10:28 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                                           10:32 function=>modifier_list fn identifier : type ( ) • { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                               10:32 function=>modifier_list fn identifier : type ( ) { • }
                                            */
                                            /*peek_level:0 offset:12 -- clause*/
                                            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==125/*[}]*/){
                                                /*assert*/
                                                /*assert*/
                                                /*
                                                   10:32 function=>modifier_list fn identifier : type ( ) { • }
                                                */
                                                /*peek_level:-1 offset:12*/
                                                /*---leaf-assert----*/
                                                consume(l,data,state);
                                                {
                                                    /*--unique-id--1--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,15);
                                                    prod = 1;
                                                    continue;
                                                }
                                            } else {
                                                /*peek-production-closure*/
                                                /*peek-production-closure*/
                                                /*
                                                   10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                                */
                                                /*peek_level:0 offset:12*/
                                                /*---leaf-peek-production-closure----*/
                                                if(state=$expression_statements(l,data,state)){
                                                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                        /*--unique-id--1--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,11);
                                                        prod = 1;
                                                        continue;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    /*peek-production-closure*/
                                    /*peek-production-closure*/
                                    /*
                                       10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                       10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if(state=$arguments(l,data,state)){
                                        /*assert*/
                                        /*assert*/
                                        /*
                                           10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                           10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:26 function=>modifier_list fn identifier : type ( arguments ) • { expression_statements }
                                               10:29 function=>modifier_list fn identifier : type ( arguments ) • { }
                                            */
                                            /*peek_level:-1 offset:12 -- clause*/
                                            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                                /*consume*/
                                                /*consume*/
                                                /*
                                                   10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                   10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                */
                                                /*peek_level:0 offset:13 -- clause*/
                                                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if(l.current_byte==125/*[}]*/){
                                                    /*assert*/
                                                    /*assert*/
                                                    /*
                                                       10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                    */
                                                    /*peek_level:-1 offset:13*/
                                                    /*---leaf-assert----*/
                                                    consume(l,data,state);
                                                    {
                                                        /*--unique-id--1--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,12);
                                                        prod = 1;
                                                        continue;
                                                    }
                                                } else {
                                                    /*peek-production-closure*/
                                                    /*peek-production-closure*/
                                                    /*
                                                       10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                    */
                                                    /*peek_level:0 offset:13*/
                                                    /*---leaf-peek-production-closure----*/
                                                    if(state=$expression_statements(l,data,state)){
                                                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                            /*--unique-id--1--DO-NOT-REPLACE*/
                                                            add_reduce(state,data,11,9);
                                                            prod = 1;
                                                            continue;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
            /*peek-production-closure*/
            /*peek-production-closure*/
            /*
               14:46 primitive_declaration=>modifier_list • identifier : type
            */
            /*peek_level:0 offset:1*/
            /*---leaf-peek-production-closure----*/
            if(state=$identifier(l,data,state)){
                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*--unique-id--1--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,26);
                        prod = 1;
                        continue;
                    }
                }
            }
        }
        break;
    }
    return assertSuccess(l,state,prod==1);
}
/*production name: import
            grammar index: 2
            bodies:
	2:7 import=>• import string - 
            compile time: 9.33ms*/;
function $import(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,88,6,6)/*[import]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           2:7 import=>import • string
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$string(l,data,state)){
            /*--unique-id--2--DO-NOT-REPLACE*/
            add_reduce(state,data,2,0);
            return state;
        }
    }
    return 0;
}
/*production name: namespace_HC_listbody3_100
            grammar index: 3
            bodies:
	3:8 namespace_HC_listbody3_100=>• namespace_HC_listbody3_100 statements - 
		3:9 namespace_HC_listbody3_100=>• statements - 
            compile time: 14.625ms*/;
function $namespace_HC_listbody3_100(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$statements(l,data,state)){
        /*--unique-id--3--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 3;
        while(1){
            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:0 offset:0 -- clause*/
            if(assert_ascii(l,0x0,0x10,0x88000000,0x0)/*tbl:[ [ ] [ _ ] [ $ ]*/||l.isUniID(data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   3:8 namespace_HC_listbody3_100=>namespace_HC_listbody3_100 • statements
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$statements(l,data,state)){
                    /*--unique-id--3--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 3;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==3);
}
/*production name: namespace
            grammar index: 4
            bodies:
	4:10 namespace=>• ns identifier { namespace_HC_listbody3_100 } - 
		4:11 namespace=>• ns identifier { } - 
            compile time: 16.899ms*/;
function $namespace(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,63,2,2)/*[ns]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           4:10 namespace=>ns • identifier { namespace_HC_listbody3_100 }
           4:11 namespace=>ns • identifier { }
        */
        /*peek_level:-1 offset:1 -- clause*/
        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$identifier(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               4:10 namespace=>ns • identifier { namespace_HC_listbody3_100 }
               4:11 namespace=>ns • identifier { }
            */
            /*peek_level:-1 offset:2 -- clause*/
            sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   4:10 namespace=>ns identifier { • namespace_HC_listbody3_100 }
                   4:11 namespace=>ns identifier { • }
                */
                /*peek_level:0 offset:3 -- clause*/
                sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(l.current_byte==125/*[}]*/){
                    /*assert*/
                    /*assert*/
                    /*
                       4:11 namespace=>ns identifier { • }
                    */
                    /*peek_level:-1 offset:3*/
                    /*---leaf-assert----*/
                    consume(l,data,state);
                    {
                        /*--unique-id--4--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,4);
                        return state;
                    }
                } else {
                    /*peek-production-closure*/
                    /*peek-production-closure*/
                    /*
                       4:10 namespace=>ns identifier { • namespace_HC_listbody3_100 }
                    */
                    /*peek_level:0 offset:3*/
                    /*---leaf-peek-production-closure----*/
                    if(state=$namespace_HC_listbody3_100(l,data,state)){
                        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                            /*--unique-id--4--DO-NOT-REPLACE*/
                            add_reduce(state,data,5,3);
                            return state;
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: class_group_110_101
            grammar index: 5
            bodies:
	5:12 class_group_110_101=>• is θid - 
            compile time: 4.55ms*/;
function $class_group_110_101(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,118,2,2)/*[is]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           5:12 class_group_110_101=>is • θid
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(l.isUniID(data)&&consume(l,data,state)){
            /*--unique-id--5--DO-NOT-REPLACE*/
            add_reduce(state,data,2,0);
            return state;
        }
    }
    return 0;
}
/*production name: class_group_013_102
            grammar index: 6
            bodies:
	6:13 class_group_013_102=>• struct - 
		6:14 class_group_013_102=>• primitive_declaration - 
		6:15 class_group_013_102=>• function - 
            compile time: 535.23ms*/;
function $class_group_013_102(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*assert-production-closure*/
        /*assert-production-closure*/
        /*
           16:50 modifier_list=>• [ modifier_list_HC_listbody1_105 ]
        */
        /*peek_level:0 offset:0*/
        if(state=$modifier_list(l,data,state)){
            /*--unique-id--16--DO-NOT-REPLACE*/
            return $class_group_013_102_goto(l,data,state,16);
        }
    } else if(cmpr_set(l,data,35,3,3)/*[str]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           6:13 class_group_013_102=>• struct
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$struct(l,data,state)){
            /*--unique-id--6--DO-NOT-REPLACE*/
            return $class_group_013_102_goto(l,data,state,6);
        }
    } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           6:15 class_group_013_102=>• function
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$function(l,data,state)){
            /*--unique-id--6--DO-NOT-REPLACE*/
            return $class_group_013_102_goto(l,data,state,6);
        }
    } else {
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           6:14 class_group_013_102=>• primitive_declaration
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$primitive_declaration(l,data,state)){
            /*--unique-id--6--DO-NOT-REPLACE*/
            return $class_group_013_102_goto(l,data,state,6);
        }
    }
    return 0;
}
function $class_group_013_102_goto(l,data,state,prod){
    while(1){
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        /*peek_level:0 offset:0 -- clause*/
        if(cmpr_set(l,data,35,3,3)/*[str]*/){
            /*peek*/
            /*peek*/
            /*
               9:22 struct=>modifier_list • str identifier { arguments }
               9:24 struct=>modifier_list • str identifier { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,35,3,3)/*[str]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   9:22 struct=>modifier_list str • identifier { arguments }
                   9:24 struct=>modifier_list str • identifier { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       9:22 struct=>modifier_list str • identifier { arguments }
                       9:24 struct=>modifier_list str • identifier { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           9:22 struct=>modifier_list str identifier { • arguments }
                           9:24 struct=>modifier_list str identifier { • }
                        */
                        /*peek_level:0 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(l.current_byte==125/*[}]*/){
                            /*assert*/
                            /*assert*/
                            /*
                               9:24 struct=>modifier_list str identifier { • }
                            */
                            /*peek_level:-1 offset:6*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                /*--unique-id--6--DO-NOT-REPLACE*/
                                add_reduce(state,data,5,7);
                                prod = 6;
                                continue;
                            }
                        } else {
                            /*peek-production-closure*/
                            /*peek-production-closure*/
                            /*
                               9:22 struct=>modifier_list str identifier { • arguments }
                            */
                            /*peek_level:0 offset:6*/
                            /*---leaf-peek-production-closure----*/
                            if(state=$arguments(l,data,state)){
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                    /*--unique-id--6--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,5);
                                    prod = 6;
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
            /*peek*/
            /*peek*/
            /*
               10:26 function=>modifier_list • fn identifier : type ( arguments ) { expression_statements }
               10:28 function=>modifier_list • fn identifier : type ( ) { expression_statements }
               10:29 function=>modifier_list • fn identifier : type ( arguments ) { }
               10:32 function=>modifier_list • fn identifier : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,124,2,2)/*[fn]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                   10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                   10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                   10:32 function=>modifier_list fn • identifier : type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                       10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                       10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                       10:32 function=>modifier_list fn • identifier : type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                           10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                           10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                           10:32 function=>modifier_list fn identifier : • type ( ) { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(state=$type(l,data,state)){
                            /*assert*/
                            /*assert*/
                            /*
                               10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                               10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                               10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                               10:32 function=>modifier_list fn identifier : • type ( ) { }
                            */
                            /*peek_level:-1 offset:7 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                                /*consume*/
                                /*consume*/
                                /*
                                   10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                   10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                   10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                   10:32 function=>modifier_list fn identifier : type ( • ) { }
                                */
                                /*peek_level:0 offset:8 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(l.current_byte==41/*[)]*/){
                                    /*peek*/
                                    /*peek*/
                                    /*
                                       10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                       10:32 function=>modifier_list fn identifier : type ( • ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           10:28 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                                           10:32 function=>modifier_list fn identifier : type ( ) • { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                               10:32 function=>modifier_list fn identifier : type ( ) { • }
                                            */
                                            /*peek_level:0 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==125/*[}]*/){
                                                /*assert*/
                                                /*assert*/
                                                /*
                                                   10:32 function=>modifier_list fn identifier : type ( ) { • }
                                                */
                                                /*peek_level:-1 offset:12*/
                                                /*---leaf-assert----*/
                                                consume(l,data,state);
                                                {
                                                    /*--unique-id--6--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,15);
                                                    prod = 6;
                                                    continue;
                                                }
                                            } else {
                                                /*peek-production-closure*/
                                                /*peek-production-closure*/
                                                /*
                                                   10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                                */
                                                /*peek_level:0 offset:12*/
                                                /*---leaf-peek-production-closure----*/
                                                if(state=$expression_statements(l,data,state)){
                                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                        /*--unique-id--6--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,11);
                                                        prod = 6;
                                                        continue;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    /*peek-production-closure*/
                                    /*peek-production-closure*/
                                    /*
                                       10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                       10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if(state=$arguments(l,data,state)){
                                        /*assert*/
                                        /*assert*/
                                        /*
                                           10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                           10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:26 function=>modifier_list fn identifier : type ( arguments ) • { expression_statements }
                                               10:29 function=>modifier_list fn identifier : type ( arguments ) • { }
                                            */
                                            /*peek_level:-1 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                                /*consume*/
                                                /*consume*/
                                                /*
                                                   10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                   10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                */
                                                /*peek_level:0 offset:13 -- clause*/
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if(l.current_byte==125/*[}]*/){
                                                    /*assert*/
                                                    /*assert*/
                                                    /*
                                                       10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                    */
                                                    /*peek_level:-1 offset:13*/
                                                    /*---leaf-assert----*/
                                                    consume(l,data,state);
                                                    {
                                                        /*--unique-id--6--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,12);
                                                        prod = 6;
                                                        continue;
                                                    }
                                                } else {
                                                    /*peek-production-closure*/
                                                    /*peek-production-closure*/
                                                    /*
                                                       10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                    */
                                                    /*peek_level:0 offset:13*/
                                                    /*---leaf-peek-production-closure----*/
                                                    if(state=$expression_statements(l,data,state)){
                                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                            /*--unique-id--6--DO-NOT-REPLACE*/
                                                            add_reduce(state,data,11,9);
                                                            prod = 6;
                                                            continue;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
            /*peek-production-closure*/
            /*peek-production-closure*/
            /*
               14:46 primitive_declaration=>modifier_list • identifier : type
            */
            /*peek_level:0 offset:1*/
            /*---leaf-peek-production-closure----*/
            if(state=$identifier(l,data,state)){
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*--unique-id--6--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,26);
                        prod = 6;
                        continue;
                    }
                }
            }
        }
        break;
    }
    return assertSuccess(l,state,prod==6);
}
/*production name: class_HC_listbody1_103
            grammar index: 7
            bodies:
	7:16 class_HC_listbody1_103=>• class_HC_listbody1_103 class_group_013_102 - 
		7:17 class_HC_listbody1_103=>• class_group_013_102 - 
            compile time: 215.664ms*/;
function $class_HC_listbody1_103(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$class_group_013_102(l,data,state)){
        /*--unique-id--7--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 7;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:0 offset:0 -- clause*/
            if(assert_ascii(l,0x0,0x10,0x88000000,0x0)/*tbl:[ [ ] [ _ ] [ $ ]*/||l.isUniID(data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   7:16 class_HC_listbody1_103=>class_HC_listbody1_103 • class_group_013_102
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$class_group_013_102(l,data,state)){
                    /*--unique-id--7--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 7;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==7);
}
/*production name: class
            grammar index: 8
            bodies:
	8:18 class=>• modifier_list cls identifier class_group_110_101 { class_HC_listbody1_103 } - 
		8:19 class=>• cls identifier class_group_110_101 { class_HC_listbody1_103 } - 
		8:20 class=>• modifier_list cls identifier class_group_110_101 { } - 
		8:21 class=>• cls identifier class_group_110_101 { } - 
            compile time: 232.252ms*/;
function $class(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           8:18 class=>• modifier_list cls identifier class_group_110_101 { class_HC_listbody1_103 }
           8:20 class=>• modifier_list cls identifier class_group_110_101 { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$modifier_list(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               8:18 class=>• modifier_list cls identifier class_group_110_101 { class_HC_listbody1_103 }
               8:20 class=>• modifier_list cls identifier class_group_110_101 { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,33,3,3)/*[cls]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   8:18 class=>modifier_list cls • identifier class_group_110_101 { class_HC_listbody1_103 }
                   8:20 class=>modifier_list cls • identifier class_group_110_101 { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       8:18 class=>modifier_list cls • identifier class_group_110_101 { class_HC_listbody1_103 }
                       8:20 class=>modifier_list cls • identifier class_group_110_101 { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$class_group_110_101(l,data,state)){
                        /*assert*/
                        /*assert*/
                        /*
                           8:18 class=>modifier_list cls identifier • class_group_110_101 { class_HC_listbody1_103 }
                           8:20 class=>modifier_list cls identifier • class_group_110_101 { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                            /*consume*/
                            /*consume*/
                            /*
                               8:18 class=>modifier_list cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                               8:20 class=>modifier_list cls identifier class_group_110_101 { • }
                            */
                            /*peek_level:0 offset:7 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(l.current_byte==125/*[}]*/){
                                /*assert*/
                                /*assert*/
                                /*
                                   8:20 class=>modifier_list cls identifier class_group_110_101 { • }
                                */
                                /*peek_level:-1 offset:7*/
                                /*---leaf-assert----*/
                                consume(l,data,state);
                                {
                                    /*--unique-id--8--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,0);
                                    return state;
                                }
                            } else {
                                /*peek-production-closure*/
                                /*peek-production-closure*/
                                /*
                                   8:18 class=>modifier_list cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                                */
                                /*peek_level:0 offset:7*/
                                /*---leaf-peek-production-closure----*/
                                if(state=$class_HC_listbody1_103(l,data,state)){
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                        /*--unique-id--8--DO-NOT-REPLACE*/
                                        add_reduce(state,data,7,0);
                                        return state;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if(cmpr_set(l,data,33,3,3)/*[cls]*/){
        /*peek*/
        /*peek*/
        /*
           8:19 class=>• cls identifier class_group_110_101 { class_HC_listbody1_103 }
           8:21 class=>• cls identifier class_group_110_101 { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(cmpr_set(l,data,33,3,3)/*[cls]*/&&consume(l,data,state)){
            /*consume*/
            /*consume*/
            /*
               8:19 class=>cls • identifier class_group_110_101 { class_HC_listbody1_103 }
               8:21 class=>cls • identifier class_group_110_101 { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$identifier(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   8:19 class=>cls • identifier class_group_110_101 { class_HC_listbody1_103 }
                   8:21 class=>cls • identifier class_group_110_101 { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$class_group_110_101(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       8:19 class=>cls identifier • class_group_110_101 { class_HC_listbody1_103 }
                       8:21 class=>cls identifier • class_group_110_101 { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           8:19 class=>cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                           8:21 class=>cls identifier class_group_110_101 { • }
                        */
                        /*peek_level:0 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(l.current_byte==125/*[}]*/){
                            /*assert*/
                            /*assert*/
                            /*
                               8:21 class=>cls identifier class_group_110_101 { • }
                            */
                            /*peek_level:-1 offset:6*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                /*--unique-id--8--DO-NOT-REPLACE*/
                                add_reduce(state,data,5,0);
                                return state;
                            }
                        } else {
                            /*peek-production-closure*/
                            /*peek-production-closure*/
                            /*
                               8:19 class=>cls identifier class_group_110_101 { • class_HC_listbody1_103 }
                            */
                            /*peek_level:0 offset:6*/
                            /*---leaf-peek-production-closure----*/
                            if(state=$class_HC_listbody1_103(l,data,state)){
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                    /*--unique-id--8--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,0);
                                    return state;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: struct
            grammar index: 9
            bodies:
	9:22 struct=>• modifier_list str identifier { arguments } - 
		9:23 struct=>• str identifier { arguments } - 
		9:24 struct=>• modifier_list str identifier { } - 
		9:25 struct=>• str identifier { } - 
            compile time: 225.073ms*/;
function $struct(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           9:22 struct=>• modifier_list str identifier { arguments }
           9:24 struct=>• modifier_list str identifier { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$modifier_list(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               9:22 struct=>• modifier_list str identifier { arguments }
               9:24 struct=>• modifier_list str identifier { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,35,3,3)/*[str]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   9:22 struct=>modifier_list str • identifier { arguments }
                   9:24 struct=>modifier_list str • identifier { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       9:22 struct=>modifier_list str • identifier { arguments }
                       9:24 struct=>modifier_list str • identifier { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           9:22 struct=>modifier_list str identifier { • arguments }
                           9:24 struct=>modifier_list str identifier { • }
                        */
                        /*peek_level:0 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(l.current_byte==125/*[}]*/){
                            /*assert*/
                            /*assert*/
                            /*
                               9:24 struct=>modifier_list str identifier { • }
                            */
                            /*peek_level:-1 offset:6*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                /*--unique-id--9--DO-NOT-REPLACE*/
                                add_reduce(state,data,5,7);
                                return state;
                            }
                        } else {
                            /*peek-production-closure*/
                            /*peek-production-closure*/
                            /*
                               9:22 struct=>modifier_list str identifier { • arguments }
                            */
                            /*peek_level:0 offset:6*/
                            /*---leaf-peek-production-closure----*/
                            if(state=$arguments(l,data,state)){
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                    /*--unique-id--9--DO-NOT-REPLACE*/
                                    add_reduce(state,data,6,5);
                                    return state;
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if(cmpr_set(l,data,35,3,3)/*[str]*/){
        /*peek*/
        /*peek*/
        /*
           9:23 struct=>• str identifier { arguments }
           9:25 struct=>• str identifier { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(cmpr_set(l,data,35,3,3)/*[str]*/&&consume(l,data,state)){
            /*consume*/
            /*consume*/
            /*
               9:23 struct=>str • identifier { arguments }
               9:25 struct=>str • identifier { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$identifier(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   9:23 struct=>str • identifier { arguments }
                   9:25 struct=>str • identifier { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                    /*consume*/
                    /*consume*/
                    /*
                       9:23 struct=>str identifier { • arguments }
                       9:25 struct=>str identifier { • }
                    */
                    /*peek_level:0 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(l.current_byte==125/*[}]*/){
                        /*assert*/
                        /*assert*/
                        /*
                           9:25 struct=>str identifier { • }
                        */
                        /*peek_level:-1 offset:5*/
                        /*---leaf-assert----*/
                        consume(l,data,state);
                        {
                            /*--unique-id--9--DO-NOT-REPLACE*/
                            add_reduce(state,data,4,8);
                            return state;
                        }
                    } else {
                        /*peek-production-closure*/
                        /*peek-production-closure*/
                        /*
                           9:23 struct=>str identifier { • arguments }
                        */
                        /*peek_level:0 offset:5*/
                        /*---leaf-peek-production-closure----*/
                        if(state=$arguments(l,data,state)){
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                /*--unique-id--9--DO-NOT-REPLACE*/
                                add_reduce(state,data,5,6);
                                return state;
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: function
            grammar index: 10
            bodies:
	10:26 function=>• modifier_list fn identifier : type ( arguments ) { expression_statements } - 
		10:27 function=>• fn identifier : type ( arguments ) { expression_statements } - 
		10:28 function=>• modifier_list fn identifier : type ( ) { expression_statements } - 
		10:29 function=>• modifier_list fn identifier : type ( arguments ) { } - 
		10:30 function=>• fn identifier : type ( ) { expression_statements } - 
		10:31 function=>• fn identifier : type ( arguments ) { } - 
		10:32 function=>• modifier_list fn identifier : type ( ) { } - 
		10:33 function=>• fn identifier : type ( ) { } - 
            compile time: 743.9ms*/;
function $function(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           10:26 function=>• modifier_list fn identifier : type ( arguments ) { expression_statements }
           10:28 function=>• modifier_list fn identifier : type ( ) { expression_statements }
           10:29 function=>• modifier_list fn identifier : type ( arguments ) { }
           10:32 function=>• modifier_list fn identifier : type ( ) { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$modifier_list(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               10:26 function=>• modifier_list fn identifier : type ( arguments ) { expression_statements }
               10:28 function=>• modifier_list fn identifier : type ( ) { expression_statements }
               10:29 function=>• modifier_list fn identifier : type ( arguments ) { }
               10:32 function=>• modifier_list fn identifier : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,124,2,2)/*[fn]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                   10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                   10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                   10:32 function=>modifier_list fn • identifier : type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$identifier(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       10:26 function=>modifier_list fn • identifier : type ( arguments ) { expression_statements }
                       10:28 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                       10:29 function=>modifier_list fn • identifier : type ( arguments ) { }
                       10:32 function=>modifier_list fn • identifier : type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                           10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                           10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                           10:32 function=>modifier_list fn identifier : • type ( ) { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(state=$type(l,data,state)){
                            /*assert*/
                            /*assert*/
                            /*
                               10:26 function=>modifier_list fn identifier : • type ( arguments ) { expression_statements }
                               10:28 function=>modifier_list fn identifier : • type ( ) { expression_statements }
                               10:29 function=>modifier_list fn identifier : • type ( arguments ) { }
                               10:32 function=>modifier_list fn identifier : • type ( ) { }
                            */
                            /*peek_level:-1 offset:7 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                                /*consume*/
                                /*consume*/
                                /*
                                   10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                   10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                   10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                   10:32 function=>modifier_list fn identifier : type ( • ) { }
                                */
                                /*peek_level:0 offset:8 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(l.current_byte==41/*[)]*/){
                                    /*peek*/
                                    /*peek*/
                                    /*
                                       10:28 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                                       10:32 function=>modifier_list fn identifier : type ( • ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           10:28 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                                           10:32 function=>modifier_list fn identifier : type ( ) • { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                               10:32 function=>modifier_list fn identifier : type ( ) { • }
                                            */
                                            /*peek_level:0 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==125/*[}]*/){
                                                /*assert*/
                                                /*assert*/
                                                /*
                                                   10:32 function=>modifier_list fn identifier : type ( ) { • }
                                                */
                                                /*peek_level:-1 offset:12*/
                                                /*---leaf-assert----*/
                                                consume(l,data,state);
                                                {
                                                    /*--unique-id--10--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,15);
                                                    return state;
                                                }
                                            } else {
                                                /*peek-production-closure*/
                                                /*peek-production-closure*/
                                                /*
                                                   10:28 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                                                */
                                                /*peek_level:0 offset:12*/
                                                /*---leaf-peek-production-closure----*/
                                                if(state=$expression_statements(l,data,state)){
                                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                        /*--unique-id--10--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,11);
                                                        return state;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    /*peek-production-closure*/
                                    /*peek-production-closure*/
                                    /*
                                       10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                       10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if(state=$arguments(l,data,state)){
                                        /*assert*/
                                        /*assert*/
                                        /*
                                           10:26 function=>modifier_list fn identifier : type ( • arguments ) { expression_statements }
                                           10:29 function=>modifier_list fn identifier : type ( • arguments ) { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:26 function=>modifier_list fn identifier : type ( arguments ) • { expression_statements }
                                               10:29 function=>modifier_list fn identifier : type ( arguments ) • { }
                                            */
                                            /*peek_level:-1 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                                /*consume*/
                                                /*consume*/
                                                /*
                                                   10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                   10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                */
                                                /*peek_level:0 offset:13 -- clause*/
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if(l.current_byte==125/*[}]*/){
                                                    /*assert*/
                                                    /*assert*/
                                                    /*
                                                       10:29 function=>modifier_list fn identifier : type ( arguments ) { • }
                                                    */
                                                    /*peek_level:-1 offset:13*/
                                                    /*---leaf-assert----*/
                                                    consume(l,data,state);
                                                    {
                                                        /*--unique-id--10--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,12);
                                                        return state;
                                                    }
                                                } else {
                                                    /*peek-production-closure*/
                                                    /*peek-production-closure*/
                                                    /*
                                                       10:26 function=>modifier_list fn identifier : type ( arguments ) { • expression_statements }
                                                    */
                                                    /*peek_level:0 offset:13*/
                                                    /*---leaf-peek-production-closure----*/
                                                    if(state=$expression_statements(l,data,state)){
                                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                            /*--unique-id--10--DO-NOT-REPLACE*/
                                                            add_reduce(state,data,11,9);
                                                            return state;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
        /*peek*/
        /*peek*/
        /*
           10:27 function=>• fn identifier : type ( arguments ) { expression_statements }
           10:30 function=>• fn identifier : type ( ) { expression_statements }
           10:31 function=>• fn identifier : type ( arguments ) { }
           10:33 function=>• fn identifier : type ( ) { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(cmpr_set(l,data,124,2,2)/*[fn]*/&&consume(l,data,state)){
            /*consume*/
            /*consume*/
            /*
               10:27 function=>fn • identifier : type ( arguments ) { expression_statements }
               10:30 function=>fn • identifier : type ( ) { expression_statements }
               10:31 function=>fn • identifier : type ( arguments ) { }
               10:33 function=>fn • identifier : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$identifier(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   10:27 function=>fn • identifier : type ( arguments ) { expression_statements }
                   10:30 function=>fn • identifier : type ( ) { expression_statements }
                   10:31 function=>fn • identifier : type ( arguments ) { }
                   10:33 function=>fn • identifier : type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    /*consume*/
                    /*consume*/
                    /*
                       10:27 function=>fn identifier : • type ( arguments ) { expression_statements }
                       10:30 function=>fn identifier : • type ( ) { expression_statements }
                       10:31 function=>fn identifier : • type ( arguments ) { }
                       10:33 function=>fn identifier : • type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*assert*/
                        /*assert*/
                        /*
                           10:27 function=>fn identifier : • type ( arguments ) { expression_statements }
                           10:30 function=>fn identifier : • type ( ) { expression_statements }
                           10:31 function=>fn identifier : • type ( arguments ) { }
                           10:33 function=>fn identifier : • type ( ) { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                            /*consume*/
                            /*consume*/
                            /*
                               10:27 function=>fn identifier : type ( • arguments ) { expression_statements }
                               10:30 function=>fn identifier : type ( • ) { expression_statements }
                               10:31 function=>fn identifier : type ( • arguments ) { }
                               10:33 function=>fn identifier : type ( • ) { }
                            */
                            /*peek_level:0 offset:7 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(l.current_byte==41/*[)]*/){
                                /*peek*/
                                /*peek*/
                                /*
                                   10:30 function=>fn identifier : type ( • ) { expression_statements }
                                   10:33 function=>fn identifier : type ( • ) { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                    /*consume*/
                                    /*consume*/
                                    /*
                                       10:30 function=>fn identifier : type ( ) • { expression_statements }
                                       10:33 function=>fn identifier : type ( ) • { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           10:30 function=>fn identifier : type ( ) { • expression_statements }
                                           10:33 function=>fn identifier : type ( ) { • }
                                        */
                                        /*peek_level:0 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(l.current_byte==125/*[}]*/){
                                            /*assert*/
                                            /*assert*/
                                            /*
                                               10:33 function=>fn identifier : type ( ) { • }
                                            */
                                            /*peek_level:-1 offset:11*/
                                            /*---leaf-assert----*/
                                            consume(l,data,state);
                                            {
                                                /*--unique-id--10--DO-NOT-REPLACE*/
                                                add_reduce(state,data,8,16);
                                                return state;
                                            }
                                        } else {
                                            /*peek-production-closure*/
                                            /*peek-production-closure*/
                                            /*
                                               10:30 function=>fn identifier : type ( ) { • expression_statements }
                                            */
                                            /*peek_level:0 offset:11*/
                                            /*---leaf-peek-production-closure----*/
                                            if(state=$expression_statements(l,data,state)){
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                    /*--unique-id--10--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,13);
                                                    return state;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                /*peek-production-closure*/
                                /*peek-production-closure*/
                                /*
                                   10:27 function=>fn identifier : type ( • arguments ) { expression_statements }
                                   10:31 function=>fn identifier : type ( • arguments ) { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(state=$arguments(l,data,state)){
                                    /*assert*/
                                    /*assert*/
                                    /*
                                       10:27 function=>fn identifier : type ( • arguments ) { expression_statements }
                                       10:31 function=>fn identifier : type ( • arguments ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           10:27 function=>fn identifier : type ( arguments ) • { expression_statements }
                                           10:31 function=>fn identifier : type ( arguments ) • { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               10:27 function=>fn identifier : type ( arguments ) { • expression_statements }
                                               10:31 function=>fn identifier : type ( arguments ) { • }
                                            */
                                            /*peek_level:0 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==125/*[}]*/){
                                                /*assert*/
                                                /*assert*/
                                                /*
                                                   10:31 function=>fn identifier : type ( arguments ) { • }
                                                */
                                                /*peek_level:-1 offset:12*/
                                                /*---leaf-assert----*/
                                                consume(l,data,state);
                                                {
                                                    /*--unique-id--10--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,14);
                                                    return state;
                                                }
                                            } else {
                                                /*peek-production-closure*/
                                                /*peek-production-closure*/
                                                /*
                                                   10:27 function=>fn identifier : type ( arguments ) { • expression_statements }
                                                */
                                                /*peek_level:0 offset:12*/
                                                /*---leaf-peek-production-closure----*/
                                                if(state=$expression_statements(l,data,state)){
                                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                        /*--unique-id--10--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,10);
                                                        return state;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: function_expression
            grammar index: 11
            bodies:
	11:34 function_expression=>• modifier_list fn : type ( arguments ) { expression_statements } - 
		11:35 function_expression=>• fn : type ( arguments ) { expression_statements } - 
		11:36 function_expression=>• modifier_list fn : type ( ) { expression_statements } - 
		11:37 function_expression=>• modifier_list fn : type ( arguments ) { } - 
		11:38 function_expression=>• fn : type ( ) { expression_statements } - 
		11:39 function_expression=>• fn : type ( arguments ) { } - 
		11:40 function_expression=>• modifier_list fn : type ( ) { } - 
		11:41 function_expression=>• fn : type ( ) { } - 
            compile time: 511.909ms*/;
function $function_expression(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           11:34 function_expression=>• modifier_list fn : type ( arguments ) { expression_statements }
           11:36 function_expression=>• modifier_list fn : type ( ) { expression_statements }
           11:37 function_expression=>• modifier_list fn : type ( arguments ) { }
           11:40 function_expression=>• modifier_list fn : type ( ) { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$modifier_list(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               11:34 function_expression=>• modifier_list fn : type ( arguments ) { expression_statements }
               11:36 function_expression=>• modifier_list fn : type ( ) { expression_statements }
               11:37 function_expression=>• modifier_list fn : type ( arguments ) { }
               11:40 function_expression=>• modifier_list fn : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(cmpr_set(l,data,undefined,undefined,2)/*[fn]*/&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   11:34 function_expression=>modifier_list fn • : type ( arguments ) { expression_statements }
                   11:36 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                   11:37 function_expression=>modifier_list fn • : type ( arguments ) { }
                   11:40 function_expression=>modifier_list fn • : type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    /*consume*/
                    /*consume*/
                    /*
                       11:34 function_expression=>modifier_list fn : • type ( arguments ) { expression_statements }
                       11:36 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                       11:37 function_expression=>modifier_list fn : • type ( arguments ) { }
                       11:40 function_expression=>modifier_list fn : • type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*assert*/
                        /*assert*/
                        /*
                           11:34 function_expression=>modifier_list fn : • type ( arguments ) { expression_statements }
                           11:36 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           11:37 function_expression=>modifier_list fn : • type ( arguments ) { }
                           11:40 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        /*peek_level:-1 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                            /*consume*/
                            /*consume*/
                            /*
                               11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                               11:36 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                               11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                               11:40 function_expression=>modifier_list fn : type ( • ) { }
                            */
                            /*peek_level:0 offset:7 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(l.current_byte==41/*[)]*/){
                                /*peek*/
                                /*peek*/
                                /*
                                   11:36 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                                   11:40 function_expression=>modifier_list fn : type ( • ) { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                    /*consume*/
                                    /*consume*/
                                    /*
                                       11:36 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                                       11:40 function_expression=>modifier_list fn : type ( ) • { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           11:36 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                                           11:40 function_expression=>modifier_list fn : type ( ) { • }
                                        */
                                        /*peek_level:0 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(l.current_byte==125/*[}]*/){
                                            /*assert*/
                                            /*assert*/
                                            /*
                                               11:40 function_expression=>modifier_list fn : type ( ) { • }
                                            */
                                            /*peek_level:-1 offset:11*/
                                            /*---leaf-assert----*/
                                            consume(l,data,state);
                                            {
                                                /*--unique-id--11--DO-NOT-REPLACE*/
                                                add_reduce(state,data,8,23);
                                                return state;
                                            }
                                        } else {
                                            /*peek-production-closure*/
                                            /*peek-production-closure*/
                                            /*
                                               11:36 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                                            */
                                            /*peek_level:0 offset:11*/
                                            /*---leaf-peek-production-closure----*/
                                            if(state=$expression_statements(l,data,state)){
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                    /*--unique-id--11--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,19);
                                                    return state;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                /*peek-production-closure*/
                                /*peek-production-closure*/
                                /*
                                   11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                                   11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(state=$arguments(l,data,state)){
                                    /*assert*/
                                    /*assert*/
                                    /*
                                       11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                                       11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           11:34 function_expression=>modifier_list fn : type ( arguments ) • { expression_statements }
                                           11:37 function_expression=>modifier_list fn : type ( arguments ) • { }
                                        */
                                        /*peek_level:-1 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               11:34 function_expression=>modifier_list fn : type ( arguments ) { • expression_statements }
                                               11:37 function_expression=>modifier_list fn : type ( arguments ) { • }
                                            */
                                            /*peek_level:0 offset:12 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==125/*[}]*/){
                                                /*assert*/
                                                /*assert*/
                                                /*
                                                   11:37 function_expression=>modifier_list fn : type ( arguments ) { • }
                                                */
                                                /*peek_level:-1 offset:12*/
                                                /*---leaf-assert----*/
                                                consume(l,data,state);
                                                {
                                                    /*--unique-id--11--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,20);
                                                    return state;
                                                }
                                            } else {
                                                /*peek-production-closure*/
                                                /*peek-production-closure*/
                                                /*
                                                   11:34 function_expression=>modifier_list fn : type ( arguments ) { • expression_statements }
                                                */
                                                /*peek_level:0 offset:12*/
                                                /*---leaf-peek-production-closure----*/
                                                if(state=$expression_statements(l,data,state)){
                                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                        /*--unique-id--11--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,10,17);
                                                        return state;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
        /*peek*/
        /*peek*/
        /*
           11:35 function_expression=>• fn : type ( arguments ) { expression_statements }
           11:38 function_expression=>• fn : type ( ) { expression_statements }
           11:39 function_expression=>• fn : type ( arguments ) { }
           11:41 function_expression=>• fn : type ( ) { }
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(cmpr_set(l,data,undefined,undefined,2)/*[fn]*/&&consume(l,data,state)){
            /*consume*/
            /*consume*/
            /*
               11:35 function_expression=>fn • : type ( arguments ) { expression_statements }
               11:38 function_expression=>fn • : type ( ) { expression_statements }
               11:39 function_expression=>fn • : type ( arguments ) { }
               11:41 function_expression=>fn • : type ( ) { }
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   11:35 function_expression=>fn : • type ( arguments ) { expression_statements }
                   11:38 function_expression=>fn : • type ( ) { expression_statements }
                   11:39 function_expression=>fn : • type ( arguments ) { }
                   11:41 function_expression=>fn : • type ( ) { }
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$type(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       11:35 function_expression=>fn : • type ( arguments ) { expression_statements }
                       11:38 function_expression=>fn : • type ( ) { expression_statements }
                       11:39 function_expression=>fn : • type ( arguments ) { }
                       11:41 function_expression=>fn : • type ( ) { }
                    */
                    /*peek_level:-1 offset:5 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           11:35 function_expression=>fn : type ( • arguments ) { expression_statements }
                           11:38 function_expression=>fn : type ( • ) { expression_statements }
                           11:39 function_expression=>fn : type ( • arguments ) { }
                           11:41 function_expression=>fn : type ( • ) { }
                        */
                        /*peek_level:0 offset:6 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(l.current_byte==41/*[)]*/){
                            /*peek*/
                            /*peek*/
                            /*
                               11:38 function_expression=>fn : type ( • ) { expression_statements }
                               11:41 function_expression=>fn : type ( • ) { }
                            */
                            /*peek_level:-1 offset:8 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                /*consume*/
                                /*consume*/
                                /*
                                   11:38 function_expression=>fn : type ( ) • { expression_statements }
                                   11:41 function_expression=>fn : type ( ) • { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                    /*consume*/
                                    /*consume*/
                                    /*
                                       11:38 function_expression=>fn : type ( ) { • expression_statements }
                                       11:41 function_expression=>fn : type ( ) { • }
                                    */
                                    /*peek_level:0 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if(l.current_byte==125/*[}]*/){
                                        /*assert*/
                                        /*assert*/
                                        /*
                                           11:41 function_expression=>fn : type ( ) { • }
                                        */
                                        /*peek_level:-1 offset:10*/
                                        /*---leaf-assert----*/
                                        consume(l,data,state);
                                        {
                                            /*--unique-id--11--DO-NOT-REPLACE*/
                                            add_reduce(state,data,7,24);
                                            return state;
                                        }
                                    } else {
                                        /*peek-production-closure*/
                                        /*peek-production-closure*/
                                        /*
                                           11:38 function_expression=>fn : type ( ) { • expression_statements }
                                        */
                                        /*peek_level:0 offset:10*/
                                        /*---leaf-peek-production-closure----*/
                                        if(state=$expression_statements(l,data,state)){
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                /*--unique-id--11--DO-NOT-REPLACE*/
                                                add_reduce(state,data,8,21);
                                                return state;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            /*peek-production-closure*/
                            /*peek-production-closure*/
                            /*
                               11:35 function_expression=>fn : type ( • arguments ) { expression_statements }
                               11:39 function_expression=>fn : type ( • arguments ) { }
                            */
                            /*peek_level:-1 offset:8 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$arguments(l,data,state)){
                                /*assert*/
                                /*assert*/
                                /*
                                   11:35 function_expression=>fn : type ( • arguments ) { expression_statements }
                                   11:39 function_expression=>fn : type ( • arguments ) { }
                                */
                                /*peek_level:-1 offset:9 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                    /*consume*/
                                    /*consume*/
                                    /*
                                       11:35 function_expression=>fn : type ( arguments ) • { expression_statements }
                                       11:39 function_expression=>fn : type ( arguments ) • { }
                                    */
                                    /*peek_level:-1 offset:10 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           11:35 function_expression=>fn : type ( arguments ) { • expression_statements }
                                           11:39 function_expression=>fn : type ( arguments ) { • }
                                        */
                                        /*peek_level:0 offset:11 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(l.current_byte==125/*[}]*/){
                                            /*assert*/
                                            /*assert*/
                                            /*
                                               11:39 function_expression=>fn : type ( arguments ) { • }
                                            */
                                            /*peek_level:-1 offset:11*/
                                            /*---leaf-assert----*/
                                            consume(l,data,state);
                                            {
                                                /*--unique-id--11--DO-NOT-REPLACE*/
                                                add_reduce(state,data,8,22);
                                                return state;
                                            }
                                        } else {
                                            /*peek-production-closure*/
                                            /*peek-production-closure*/
                                            /*
                                               11:35 function_expression=>fn : type ( arguments ) { • expression_statements }
                                            */
                                            /*peek_level:0 offset:11*/
                                            /*---leaf-peek-production-closure----*/
                                            if(state=$expression_statements(l,data,state)){
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                    /*--unique-id--11--DO-NOT-REPLACE*/
                                                    add_reduce(state,data,9,18);
                                                    return state;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: arguments
            grammar index: 13
            bodies:
	13:44 arguments=>• arguments , primitive_declaration - 
		13:45 arguments=>• primitive_declaration - 
            compile time: 434.017ms*/;
function $arguments(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$primitive_declaration(l,data,state)){
        /*--unique-id--13--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 13;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:-1 offset:0 -- clause*/
            if(l.current_byte==44/*[,]*/){
                /*assert*/
                /*assert*/
                /*
                   13:44 arguments=>arguments • , primitive_declaration
                */
                /*peek_level:-1 offset:1*/
                /*---leaf-assert----*/
                consume(l,data,state);
                {
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$primitive_declaration(l,data,state)){
                        /*--unique-id--13--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,25);
                        prod = 13;
                        continue;
                    }
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==13);
}
/*production name: primitive_declaration
            grammar index: 14
            bodies:
	14:46 primitive_declaration=>• modifier_list identifier : type - 
		14:47 primitive_declaration=>• identifier : type - 
            compile time: 9.752ms*/;
function $primitive_declaration(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(l.current_byte==91/*[[]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           14:46 primitive_declaration=>• modifier_list identifier : type
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$modifier_list(l,data,state)){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$identifier(l,data,state)){
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*--unique-id--14--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,26);
                        return state;
                    }
                }
            }
        }
    } else {
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           14:47 primitive_declaration=>• identifier : type
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$identifier(l,data,state)){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$type(l,data,state)){
                    /*--unique-id--14--DO-NOT-REPLACE*/
                    add_reduce(state,data,3,27);
                    return state;
                }
            }
        }
    }
    return 0;
}
/*production name: modifier_list_HC_listbody1_105
            grammar index: 15
            bodies:
	15:48 modifier_list_HC_listbody1_105=>• modifier_list_HC_listbody1_105 modifier - 
		15:49 modifier_list_HC_listbody1_105=>• modifier - 
            compile time: 5.762ms*/;
function $modifier_list_HC_listbody1_105(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$modifier(l,data,state)){
        /*--unique-id--15--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 15;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:0 offset:0 -- clause*/
            if(l.isUniID(data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   15:48 modifier_list_HC_listbody1_105=>modifier_list_HC_listbody1_105 • modifier
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$modifier(l,data,state)){
                    /*--unique-id--15--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 15;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==15);
}
/*production name: modifier_list
            grammar index: 16
            bodies:
	16:50 modifier_list=>• [ modifier_list_HC_listbody1_105 ] - 
            compile time: 5.229ms*/;
function $modifier_list(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((l.current_byte==91/*[[]*/)&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           16:50 modifier_list=>[ • modifier_list_HC_listbody1_105 ]
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$modifier_list_HC_listbody1_105(l,data,state)){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
                /*--unique-id--16--DO-NOT-REPLACE*/
                add_reduce(state,data,3,28);
                return state;
            }
        }
    }
    return 0;
}
/*production name: expression_statements
            grammar index: 18
            bodies:
	18:53 expression_statements=>• expression_statements ; expression - 
		18:54 expression_statements=>• expression - 
            compile time: 218.91ms*/;
function $expression_statements(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$expression(l,data,state)){
        /*--unique-id--18--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 18;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:-1 offset:0 -- clause*/
            if(l.current_byte==59/*[;]*/){
                /*assert*/
                /*assert*/
                /*
                   18:53 expression_statements=>expression_statements • ; expression
                */
                /*peek_level:-1 offset:1*/
                /*---leaf-assert----*/
                consume(l,data,state);
                {
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$expression(l,data,state)){
                        /*--unique-id--18--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,25);
                        prod = 18;
                        continue;
                    }
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==18);
}
/*production name: expression_HC_listbody1_107
            grammar index: 19
            bodies:
	19:55 expression_HC_listbody1_107=>• expression_HC_listbody1_107 ; expression - 
		19:56 expression_HC_listbody1_107=>• expression - 
            compile time: 4.851ms*/;
function $expression_HC_listbody1_107(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$expression(l,data,state)){
        /*--unique-id--19--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 19;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:-1 offset:0 -- clause*/
            if(l.current_byte==59/*[;]*/){
                /*assert*/
                /*assert*/
                /*
                   19:55 expression_HC_listbody1_107=>expression_HC_listbody1_107 • ; expression
                */
                /*peek_level:-1 offset:1*/
                /*---leaf-assert----*/
                consume(l,data,state);
                {
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$expression(l,data,state)){
                        /*--unique-id--19--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,25);
                        prod = 19;
                        continue;
                    }
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==19);
}
/*production name: expression
            grammar index: 20
            bodies:
	20:57 expression=>• assignment_expression - 
		20:58 expression=>• if_expression - 
		20:59 expression=>• binary_expression - 
		20:60 expression=>• match_expression - 
		20:61 expression=>• function_expression - 
		20:62 expression=>• call_expression - 
		20:63 expression=>• member_expression - 
		20:64 expression=>• break_expression - 
		20:65 expression=>• ( expression ) - 
		20:66 expression=>• { expression_HC_listbody1_107 } - 
		20:67 expression=>• value - 
		20:68 expression=>• { } - 
            compile time: 1992.797ms*/;
function $expression(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    switch(defined_token_82c8039af910f43f(l,data)){
        case 0:
            /*peek_level:0 offset:0*/
            if(state=$modifier_list(l,data,state)){
                /*--unique-id--16--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,16);
            }
            break;
        case 1:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$if_expression(l,data,state)){
                /*--unique-id--20--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,20);
            }
            break;
        case 2:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$match_expression(l,data,state)){
                /*--unique-id--20--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,20);
            }
            break;
        case 3:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$function_expression(l,data,state)){
                /*--unique-id--20--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,20);
            }
            break;
        case 4:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$break_expression(l,data,state)){
                /*--unique-id--20--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,20);
            }
            break;
        case 5:
            /*peek_level:-1 offset:0*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$expression(l,data,state)){
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                        /*--unique-id--20--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,0);
                        return $expression_goto(l,data,state,20);
                    }
                }
            }
            break;
        case 6:
            /*peek_level:-1 offset:2 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   20:66 expression=>{ • expression_HC_listbody1_107 }
                   20:68 expression=>{ • }
                */
                /*peek_level:0 offset:3 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(l.current_byte==125/*[}]*/){
                    /*assert*/
                    /*assert*/
                    /*
                       20:68 expression=>{ • }
                    */
                    /*peek_level:-1 offset:3*/
                    /*---leaf-assert----*/
                    consume(l,data,state);
                    {
                        /*--unique-id--20--DO-NOT-REPLACE*/
                        add_reduce(state,data,2,0);
                        return $expression_goto(l,data,state,20);
                    }
                } else {
                    /*peek-production-closure*/
                    /*peek-production-closure*/
                    /*
                       20:66 expression=>{ • expression_HC_listbody1_107 }
                    */
                    /*peek_level:0 offset:3*/
                    /*---leaf-peek-production-closure----*/
                    if(state=$expression_HC_listbody1_107(l,data,state)){
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                            /*--unique-id--20--DO-NOT-REPLACE*/
                            add_reduce(state,data,3,0);
                            return $expression_goto(l,data,state,20);
                        }
                    }
                }
            }
            break;
        case 7:
            /*peek_level:0 offset:0*/
            /*---leaf-peek-production-closure----*/
            if(state=$value(l,data,state)){
                /*--unique-id--20--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,20);
            }
            break;
        case 8:
            /*peek_level:0 offset:0*/
            if(state=$identifier(l,data,state)){
                /*--unique-id--46--DO-NOT-REPLACE*/
                return $expression_goto(l,data,state,46);
            }
            break;
    }
    return 0;
}
function $expression_goto(l,data,state,prod){
    while(1){
        switch(prod){
            case 16:
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                /*peek_level:0 offset:0 -- clause*/
                if(l.current_byte==91/*[[]*/){
                    /*peek-production-closure*/
                    /*peek-production-closure*/
                    /*
                       21:69 assignment_expression=>modifier_list • primitive_declaration = expression
                    */
                    /*peek_level:0 offset:1*/
                    /*---leaf-peek-production-closure----*/
                    if(state=$primitive_declaration(l,data,state)){
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==61/*[=]*/)&&consume(l,data,state)){
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$expression(l,data,state)){
                                /*--unique-id--20--DO-NOT-REPLACE*/
                                add_reduce(state,data,4,0);
                                prod = 20;
                                continue;
                            }
                        }
                    }
                } else if(cmpr_set(l,data,124,2,2)/*[fn]*/){
                    /*peek*/
                    /*peek*/
                    /*
                       11:34 function_expression=>modifier_list • fn : type ( arguments ) { expression_statements }
                       11:36 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       11:37 function_expression=>modifier_list • fn : type ( arguments ) { }
                       11:40 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*peek_level:-1 offset:3 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(cmpr_set(l,data,undefined,undefined,2)/*[fn]*/&&consume(l,data,state)){
                        /*consume*/
                        /*consume*/
                        /*
                           11:34 function_expression=>modifier_list fn • : type ( arguments ) { expression_statements }
                           11:36 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                           11:37 function_expression=>modifier_list fn • : type ( arguments ) { }
                           11:40 function_expression=>modifier_list fn • : type ( ) { }
                        */
                        /*peek_level:-1 offset:4 -- clause*/
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                            /*consume*/
                            /*consume*/
                            /*
                               11:34 function_expression=>modifier_list fn : • type ( arguments ) { expression_statements }
                               11:36 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                               11:37 function_expression=>modifier_list fn : • type ( arguments ) { }
                               11:40 function_expression=>modifier_list fn : • type ( ) { }
                            */
                            /*peek_level:-1 offset:5 -- clause*/
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$type(l,data,state)){
                                /*assert*/
                                /*assert*/
                                /*
                                   11:34 function_expression=>modifier_list fn : • type ( arguments ) { expression_statements }
                                   11:36 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                                   11:37 function_expression=>modifier_list fn : • type ( arguments ) { }
                                   11:40 function_expression=>modifier_list fn : • type ( ) { }
                                */
                                /*peek_level:-1 offset:6 -- clause*/
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==40/*[(]*/)&&consume(l,data,state)){
                                    /*consume*/
                                    /*consume*/
                                    /*
                                       11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                                       11:36 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                                       11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                                       11:40 function_expression=>modifier_list fn : type ( • ) { }
                                    */
                                    /*peek_level:0 offset:7 -- clause*/
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if(l.current_byte==41/*[)]*/){
                                        /*peek*/
                                        /*peek*/
                                        /*
                                           11:36 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                                           11:40 function_expression=>modifier_list fn : type ( • ) { }
                                        */
                                        /*peek_level:-1 offset:9 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                            /*consume*/
                                            /*consume*/
                                            /*
                                               11:36 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                                               11:40 function_expression=>modifier_list fn : type ( ) • { }
                                            */
                                            /*peek_level:-1 offset:10 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                                /*consume*/
                                                /*consume*/
                                                /*
                                                   11:36 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                                                   11:40 function_expression=>modifier_list fn : type ( ) { • }
                                                */
                                                /*peek_level:0 offset:11 -- clause*/
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if(l.current_byte==125/*[}]*/){
                                                    /*assert*/
                                                    /*assert*/
                                                    /*
                                                       11:40 function_expression=>modifier_list fn : type ( ) { • }
                                                    */
                                                    /*peek_level:-1 offset:11*/
                                                    /*---leaf-assert----*/
                                                    consume(l,data,state);
                                                    {
                                                        /*--unique-id--20--DO-NOT-REPLACE*/
                                                        add_reduce(state,data,8,23);
                                                        prod = 20;
                                                        continue;
                                                    }
                                                } else {
                                                    /*peek-production-closure*/
                                                    /*peek-production-closure*/
                                                    /*
                                                       11:36 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                                                    */
                                                    /*peek_level:0 offset:11*/
                                                    /*---leaf-peek-production-closure----*/
                                                    if(state=$expression_statements(l,data,state)){
                                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                        if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                            /*--unique-id--20--DO-NOT-REPLACE*/
                                                            add_reduce(state,data,9,19);
                                                            prod = 20;
                                                            continue;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        /*peek-production-closure*/
                                        /*peek-production-closure*/
                                        /*
                                           11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                                           11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                                        */
                                        /*peek_level:-1 offset:9 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(state=$arguments(l,data,state)){
                                            /*assert*/
                                            /*assert*/
                                            /*
                                               11:34 function_expression=>modifier_list fn : type ( • arguments ) { expression_statements }
                                               11:37 function_expression=>modifier_list fn : type ( • arguments ) { }
                                            */
                                            /*peek_level:-1 offset:10 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                                /*consume*/
                                                /*consume*/
                                                /*
                                                   11:34 function_expression=>modifier_list fn : type ( arguments ) • { expression_statements }
                                                   11:37 function_expression=>modifier_list fn : type ( arguments ) • { }
                                                */
                                                /*peek_level:-1 offset:11 -- clause*/
                                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                if((l.current_byte==123/*[{]*/)&&consume(l,data,state)){
                                                    /*consume*/
                                                    /*consume*/
                                                    /*
                                                       11:34 function_expression=>modifier_list fn : type ( arguments ) { • expression_statements }
                                                       11:37 function_expression=>modifier_list fn : type ( arguments ) { • }
                                                    */
                                                    /*peek_level:0 offset:12 -- clause*/
                                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                    if(l.current_byte==125/*[}]*/){
                                                        /*assert*/
                                                        /*assert*/
                                                        /*
                                                           11:37 function_expression=>modifier_list fn : type ( arguments ) { • }
                                                        */
                                                        /*peek_level:-1 offset:12*/
                                                        /*---leaf-assert----*/
                                                        consume(l,data,state);
                                                        {
                                                            /*--unique-id--20--DO-NOT-REPLACE*/
                                                            add_reduce(state,data,9,20);
                                                            prod = 20;
                                                            continue;
                                                        }
                                                    } else {
                                                        /*peek-production-closure*/
                                                        /*peek-production-closure*/
                                                        /*
                                                           11:34 function_expression=>modifier_list fn : type ( arguments ) { • expression_statements }
                                                        */
                                                        /*peek_level:0 offset:12*/
                                                        /*---leaf-peek-production-closure----*/
                                                        if(state=$expression_statements(l,data,state)){
                                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                                            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                                                                /*--unique-id--20--DO-NOT-REPLACE*/
                                                                add_reduce(state,data,10,17);
                                                                prod = 20;
                                                                continue;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*peek*/
                    /*peek*/
                    /*
                       21:69 assignment_expression=>modifier_list • primitive_declaration = expression
                       14:46 primitive_declaration=>modifier_list • identifier : type
                    */
                    /*69:4:1|->   <46:4:1|-*/
                    /*[id]generated [_]symbol [$]symbol*/
                    /*peek_level:0 offset:0*/
                    if(state=$identifier(l,data,state)){
                        /*--unique-id--46--DO-NOT-REPLACE*/
                        prod = 46;
                        while(1){
                            switch(prod){
                                case 46:
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    /*peek_level:-1 offset:0 -- clause*/
                                    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           14:47 primitive_declaration=>identifier : • type
                                           57:165 virtual-46:4:1|-=>identifier : • type
                                        */
                                        /*peek_level:-1 offset:2 -- clause*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(state=$type(l,data,state)){
                                            /*assert*/
                                            /*assert*/
                                            /*
                                               14:47 primitive_declaration=>identifier : • type
                                               57:165 virtual-46:4:1|-=>identifier : • type
                                            */
                                            /*peek_level:-1 offset:3 -- clause*/
                                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                            if(l.current_byte==61/*[=]*/){
                                                /*assert-end*/
                                                /*assert-end*/
                                                /*
                                                   14:47 primitive_declaration=>identifier : type •
                                                */
                                                /*peek_level:-1 offset:3*/
                                                /*---leaf-assert-end----*/
                                                /*--unique-id--14--DO-NOT-REPLACE*/
                                                add_reduce(state,data,3,27);
                                                prod = 14;
                                                continue;
                                            } else {
                                                /*assert-end*/
                                                /*assert-end*/
                                                /*
                                                   57:165 virtual-46:4:1|-=>identifier : type •
                                                */
                                                /*peek_level:0 offset:4*/
                                                /*---leaf-assert-end----*/
                                                /*--unique-id--57--DO-NOT-REPLACE*/
                                                add_reduce(state,data,3,0);
                                                prod = 57;
                                                continue;
                                            }
                                        }
                                    }
                                    break;
                                case 14:
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    /*peek_level:-1 offset:0 -- clause*/
                                    if((l.current_byte==61/*[=]*/)&&consume(l,data,state)){
                                        /*consume*/
                                        /*consume*/
                                        /*
                                           56:164 virtual-69:4:1|-=>primitive_declaration = • expression
                                        */
                                        /*peek_level:-1 offset:1*/
                                        /*---leaf-consume----*/
                                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                        if(state=$expression(l,data,state)){
                                            /*--unique-id--56--DO-NOT-REPLACE*/
                                            add_reduce(state,data,3,0);
                                            prod = 56;
                                            continue;
                                        }
                                    }
                                    break;
                            }
                            break;
                        }
                    }
                    /*21:69 assignment_expression=>modifier_list primitive_declaration = expression •*/
                    if(prod==56){
                        add_reduce(state,data,4,0);
                        prod = 21;
                        continue;
                        /*14:46 primitive_declaration=>modifier_list identifier : type •*/
                    } else if(prod==57){
                        add_reduce(state,data,4,26);
                        prod = 14;
                        continue;
                    }
                }
                break;
            case 46:
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                /*peek_level:-1 offset:0 -- clause*/
                if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                    /*consume*/
                    /*consume*/
                    /*
                       14:47 primitive_declaration=>identifier : • type
                    */
                    /*peek_level:-1 offset:1*/
                    /*---leaf-consume----*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$type(l,data,state)){
                        /*--unique-id--14--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,27);
                        prod = 14;
                        continue;
                    }
                } else {
                    /*assert-end*/
                    /*assert-end*/
                    /*
                       31:90 member_expression=>identifier •
                    */
                    /*peek_level:0 offset:2*/
                    /*---leaf-assert-end----*/
                    /*--unique-id--31--DO-NOT-REPLACE*/
                    prod = 31;
                    continue;
                }
                break;
            case 14:
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                /*peek_level:-1 offset:0 -- clause*/
                if((l.current_byte==61/*[=]*/)&&consume(l,data,state)){
                    /*consume*/
                    /*consume*/
                    /*
                       21:71 assignment_expression=>primitive_declaration = • expression
                    */
                    /*peek_level:-1 offset:1*/
                    /*---leaf-consume----*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$expression(l,data,state)){
                        /*--unique-id--20--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,0);
                        prod = 20;
                        continue;
                    }
                }
                break;
            case 31:
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                /*peek_level:-1 offset:0 -- clause*/
                switch(defined_token_b42b030566ff279e(l,data)){
                    case 0:
                        /*peek_level:-1 offset:1*/
                        /*---leaf-assert----*/
                        consume(l,data,state);
                        {
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$expression(l,data,state)){
                                /*--unique-id--20--DO-NOT-REPLACE*/
                                add_reduce(state,data,3,0);
                                prod = 20;
                                continue;
                            }
                        }
                        break;
                    case 1:
                        /*peek_level:-1 offset:1*/
                        /*---leaf-assert----*/
                        consume(l,data,state);
                        {
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$identifier(l,data,state)){
                                /*--unique-id--31--DO-NOT-REPLACE*/
                                add_reduce(state,data,3,0);
                                prod = 31;
                                continue;
                            }
                        }
                        break;
                    case 2:
                        /*peek_level:-1 offset:1*/
                        /*---leaf-assert----*/
                        consume(l,data,state);
                        {
                            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                            if(state=$expression(l,data,state)){
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
                                    /*--unique-id--31--DO-NOT-REPLACE*/
                                    add_reduce(state,data,4,0);
                                    prod = 31;
                                    continue;
                                }
                            }
                        }
                        break;
                    case 3:
                        /*peek_level:1 offset:1 -- clause*/
                        let pk = l.copy();
                        sk_01ebdfddd6029592(pk.next(data)/*[ ws ][ nl ][ 55 ]*/,data);
                        if(pk.current_byte==41/*[)]*/){
                            /*assert*/
                            /*assert*/
                            /*
                               30:87 call_expression=>member_expression • ( )
                            */
                            /*peek_level:1 offset:1*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                    /*--unique-id--20--DO-NOT-REPLACE*/
                                    add_reduce(state,data,3,0);
                                    prod = 20;
                                    continue;
                                }
                            }
                        } else {
                            /*assert*/
                            /*assert*/
                            /*
                               30:86 call_expression=>member_expression • ( call_expression_HC_listbody2_111 )
                            */
                            /*peek_level:1 offset:1*/
                            /*---leaf-assert----*/
                            consume(l,data,state);
                            {
                                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                if(state=$call_expression_HC_listbody2_111(l,data,state)){
                                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                                    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                                        /*--unique-id--20--DO-NOT-REPLACE*/
                                        add_reduce(state,data,4,0);
                                        prod = 20;
                                        continue;
                                    }
                                }
                            }
                        }
                        break;
                    case 4:
                        /*peek_level:-1 offset:1*/
                        /*---leaf-assert-end----*/
                        /*--unique-id--24--DO-NOT-REPLACE*/
                        prod = 24;
                        continue;
                        break;
                }
                break;
            case 24:
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                /*peek_level:-1 offset:0 -- clause*/
                if(!l.isSym(true,data)||assert_ascii(l,0x0,0xc001300,0x28000000,0x28000000)/*tbl:[ ; ] [ : ] [ ] ] [ } ] [ [ ] [ ) ] [ , ] [ ( ] [ { ]*/){
                    /*assert-end*/
                    /*assert-end*/
                    /*
                       20:59 expression=>binary_expression •
                    */
                    /*peek_level:0 offset:2*/
                    /*---leaf-assert-end----*/
                    /*--unique-id--20--DO-NOT-REPLACE*/
                    prod = 20;
                    continue;
                } else if(l.isSym(true,data)){
                    /*assert-production-closure*/
                    /*assert-production-closure*/
                    /*
                       24:75 binary_expression=>binary_expression • sym expression
                    */
                    /*peek_level:-1 offset:1*/
                    /*---leaf-assert-production-closure----*/
                    if(state=$sym(l,data,state)){
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if(state=$expression(l,data,state)){
                            /*--unique-id--24--DO-NOT-REPLACE*/
                            add_reduce(state,data,3,29);
                            prod = 24;
                            continue;
                        }
                    }
                }
                break;
        }
        break;
    }
    return assertSuccess(l,state,prod==20);
}
/*production name: if_expression_group_135_108
            grammar index: 22
            bodies:
	22:72 if_expression_group_135_108=>• else expression - 
            compile time: 1.47ms*/;
function $if_expression_group_135_108(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,98,undefined,4)/*[else]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           22:72 if_expression_group_135_108=>else • expression
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$expression(l,data,state)){
            /*--unique-id--22--DO-NOT-REPLACE*/
            add_reduce(state,data,2,0);
            return state;
        }
    }
    return 0;
}
/*production name: if_expression
            grammar index: 23
            bodies:
	23:73 if_expression=>• if expression : expression if_expression_group_135_108 - 
		23:74 if_expression=>• if expression : expression - 
            compile time: 4.81ms*/;
function $if_expression(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,120,2,2)/*[if]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           23:73 if_expression=>if • expression : expression if_expression_group_135_108
           23:74 if_expression=>if • expression : expression
        */
        /*peek_level:-1 offset:1 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$expression(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               23:73 if_expression=>if • expression : expression if_expression_group_135_108
               23:74 if_expression=>if • expression : expression
            */
            /*peek_level:-1 offset:2 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   23:73 if_expression=>if expression : • expression if_expression_group_135_108
                   23:74 if_expression=>if expression : • expression
                */
                /*peek_level:-1 offset:3 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(state=$expression(l,data,state)){
                    /*assert*/
                    /*assert*/
                    /*
                       23:73 if_expression=>if expression : • expression if_expression_group_135_108
                       23:74 if_expression=>if expression : • expression
                    */
                    /*peek_level:-1 offset:4 -- clause*/
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(cmpr_set(l,data,98,undefined,4)/*[else]*/){
                        /*assert-production-closure*/
                        /*assert-production-closure*/
                        /*
                           23:73 if_expression=>if expression : expression • if_expression_group_135_108
                        */
                        /*peek_level:-1 offset:4*/
                        /*---leaf-assert-production-closure----*/
                        if(state=$if_expression_group_135_108(l,data,state)){
                            /*--unique-id--23--DO-NOT-REPLACE*/
                            add_reduce(state,data,5,0);
                            return state;
                        }
                    } else {
                        /*assert-end*/
                        /*assert-end*/
                        /*
                           23:74 if_expression=>if expression : expression •
                        */
                        /*peek_level:0 offset:5*/
                        /*---leaf-assert-end----*/
                        /*--unique-id--23--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,0);
                        return state;
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: match_expression
            grammar index: 25
            bodies:
	25:77 match_expression=>• match expression : match_list ; - 
		25:78 match_expression=>• match expression : ; - 
            compile time: 4.555ms*/;
function $match_expression(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,52,5,5)/*[match]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           25:77 match_expression=>match • expression : match_list ;
           25:78 match_expression=>match • expression : ;
        */
        /*peek_level:-1 offset:1 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$expression(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               25:77 match_expression=>match • expression : match_list ;
               25:78 match_expression=>match • expression : ;
            */
            /*peek_level:-1 offset:2 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
                /*consume*/
                /*consume*/
                /*
                   25:77 match_expression=>match expression : • match_list ;
                   25:78 match_expression=>match expression : • ;
                */
                /*peek_level:0 offset:3 -- clause*/
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if(l.current_byte==59/*[;]*/){
                    /*assert*/
                    /*assert*/
                    /*
                       25:78 match_expression=>match expression : • ;
                    */
                    /*peek_level:-1 offset:3*/
                    /*---leaf-assert----*/
                    consume(l,data,state);
                    {
                        /*--unique-id--25--DO-NOT-REPLACE*/
                        add_reduce(state,data,4,0);
                        return state;
                    }
                } else {
                    /*peek-production-closure*/
                    /*peek-production-closure*/
                    /*
                       25:77 match_expression=>match expression : • match_list ;
                    */
                    /*peek_level:0 offset:3*/
                    /*---leaf-peek-production-closure----*/
                    if(state=$match_list(l,data,state)){
                        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                        if((l.current_byte==59/*[;]*/)&&consume(l,data,state)){
                            /*--unique-id--25--DO-NOT-REPLACE*/
                            add_reduce(state,data,5,0);
                            return state;
                        }
                    }
                }
            }
        }
    }
    return 0;
}
/*production name: match_list_group_240_109
            grammar index: 26
            bodies:
	26:79 match_list_group_240_109=>• expression : expression - 
            compile time: 3.62ms*/;
function $match_list_group_240_109(l,data,state){
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$expression(l,data,state)){
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$expression(l,data,state)){
                /*--unique-id--26--DO-NOT-REPLACE*/
                add_reduce(state,data,3,0);
                return state;
            }
        }
    }
    return 0;
}
/*production name: match_list
            grammar index: 28
            bodies:
	28:82 match_list=>• match_list , match_list_group_240_109 - 
		28:83 match_list=>• match_list_group_240_109 - 
            compile time: 3.124ms*/;
function $match_list(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$match_list_group_240_109(l,data,state)){
        /*--unique-id--28--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 28;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:-1 offset:0 -- clause*/
            if(l.current_byte==44/*[,]*/){
                /*assert*/
                /*assert*/
                /*
                   28:82 match_list=>match_list • , match_list_group_240_109
                */
                /*peek_level:-1 offset:1*/
                /*---leaf-assert----*/
                consume(l,data,state);
                {
                    sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                    if(state=$match_list_group_240_109(l,data,state)){
                        /*--unique-id--28--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,25);
                        prod = 28;
                        continue;
                    }
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==28);
}
/*production name: call_expression_HC_listbody2_111
            grammar index: 29
            bodies:
	29:84 call_expression_HC_listbody2_111=>• call_expression_HC_listbody2_111 expression - 
		29:85 call_expression_HC_listbody2_111=>• expression - 
            compile time: 6.102ms*/;
function $call_expression_HC_listbody2_111(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$expression(l,data,state)){
        /*--unique-id--29--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 29;
        while(1){
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            /*peek_level:0 offset:0 -- clause*/
            if((assert_ascii(l,0x0,0x114,0x88000000,0x8000000)/*tbl:[ [ ] [ _ ] [ $ ] [ ( ] [ { ] [ " ]*/||l.isUniID(data))||l.isNum(data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   29:84 call_expression_HC_listbody2_111=>call_expression_HC_listbody2_111 • expression
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$expression(l,data,state)){
                    /*--unique-id--29--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 29;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==29);
}
/*production name: break_expression
            grammar index: 32
            bodies:
	32:91 break_expression=>• break ; - 
            compile time: 1.265ms*/;
function $break_expression(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(cmpr_set(l,data,57,5,5)/*[break]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           32:91 break_expression=>break • ;
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if((l.current_byte==59/*[;]*/)&&consume(l,data,state)){
            /*--unique-id--32--DO-NOT-REPLACE*/
            add_reduce(state,data,2,0);
            return state;
        }
    }
    return 0;
}
/*production name: sym_HC_listbody2_112
            grammar index: 33
            bodies:
	33:92 sym_HC_listbody2_112=>• sym_HC_listbody2_112 θsym - 
		33:93 sym_HC_listbody2_112=>• θsym - 
            compile time: 2.708ms*/;
function $sym_HC_listbody2_112(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0 -- clause*/
    if(l.isSym(true,data)&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           33:93 sym_HC_listbody2_112=>θsym •
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        /*--unique-id--33--DO-NOT-REPLACE*/
        add_reduce(state,data,1,31);
        prod = 33;
        while(1){
            sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
            if(assert_ascii(l,0x0,0x100,0x8000000,0x8000000)/*tbl:[ [ ] [ ( ] [ { ]*/){
                return state;
            }
            /*peek_level:-1 offset:0 -- clause*/
            if(l.isSym(true,data)){
                /*assert*/
                /*assert*/
                /*
                   33:92 sym_HC_listbody2_112=>sym_HC_listbody2_112 • θsym
                */
                /*peek_level:-1 offset:1*/
                /*---leaf-assert----*/
                consume(l,data,state);
                {
                    /*--unique-id--33--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,30);
                    prod = 33;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==33);
}
/*production name: sym_group_047_113
            grammar index: 34
            bodies:
	34:94 sym_group_047_113=>• θws - 
            compile time: 1.35ms*/;
function $sym_group_047_113(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           34:94 sym_group_047_113=>θws •
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        /*--unique-id--34--DO-NOT-REPLACE*/
        return state;
    }
    return 0;
}
/*production name: sym
            grammar index: 35
            bodies:
	35:95 sym=>• sym_HC_listbody2_112 sym_group_047_113 - 
		35:96 sym=>• sym_HC_listbody2_112 - 
            compile time: 2.921ms*/;
function $sym(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(state=$sym_HC_listbody2_112(l,data,state)){
        /*assert*/
        /*assert*/
        /*
           35:95 sym=>• sym_HC_listbody2_112 sym_group_047_113
           35:96 sym=>• sym_HC_listbody2_112
        */
        /*peek_level:-1 offset:1 -- clause*/
        sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
        if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
            /*assert-production-closure*/
            /*assert-production-closure*/
            /*
               35:95 sym=>sym_HC_listbody2_112 • sym_group_047_113
            */
            /*peek_level:-1 offset:1*/
            /*---leaf-assert-production-closure----*/
            if(state=$sym_group_047_113(l,data,state)){
                /*--unique-id--35--DO-NOT-REPLACE*/
                add_reduce(state,data,2,32);
                return state;
            }
        } else {
            /*assert-end*/
            /*assert-end*/
            /*
               35:96 sym=>sym_HC_listbody2_112 •
            */
            /*peek_level:0 offset:2*/
            /*---leaf-assert-end----*/
            /*--unique-id--35--DO-NOT-REPLACE*/
            add_reduce(state,data,1,32);
            return state;
        }
    }
    return 0;
}
/*production name: type_group_053_114
            grammar index: 36
            bodies:
	36:97 type_group_053_114=>• uint - 
		36:98 type_group_053_114=>• int - 
		36:99 type_group_053_114=>• unsigned - 
		36:100 type_group_053_114=>• integer - 
            compile time: 3.914ms*/;
function $type_group_053_114(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(defined_token_44988bc5e23c2dbb(l,data)/*[uint] [unsigned]*/||defined_token_890e635c95d9af32(l,data)/*[int] [integer]*/){
        /*assert*/
        /*assert*/
        /*
           36:97 type_group_053_114=>• uint
           36:98 type_group_053_114=>• int
           36:99 type_group_053_114=>• unsigned
           36:100 type_group_053_114=>• integer
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--36--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: type_group_058_115
            grammar index: 37
            bodies:
	37:101 type_group_058_115=>• 8 - 
		37:102 type_group_058_115=>• 16 - 
		37:103 type_group_058_115=>• 32 - 
		37:104 type_group_058_115=>• 64 - 
		37:105 type_group_058_115=>• 128 - 
            compile time: 2.942ms*/;
function $type_group_058_115(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(((defined_token_5eb825c2bea966aa(l,data)/*[16] [128]*/||cmpr_set(l,data,74,2,2)/*[32]*/)||cmpr_set(l,data,76,2,2)/*[64]*/)||(l.current_byte==56/*[8]*/)){
        /*assert*/
        /*assert*/
        /*
           37:101 type_group_058_115=>• 8
           37:102 type_group_058_115=>• 16
           37:103 type_group_058_115=>• 32
           37:104 type_group_058_115=>• 64
           37:105 type_group_058_115=>• 128
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--37--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: type_group_063_116
            grammar index: 38
            bodies:
	38:106 type_group_063_116=>• float - 
		38:107 type_group_063_116=>• fp - 
		38:108 type_group_063_116=>• flt - 
            compile time: 3.922ms*/;
function $type_group_063_116(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(defined_token_36355867e1260ecf(l,data)/*[float] [fp] [flt]*/){
        /*assert*/
        /*assert*/
        /*
           38:106 type_group_063_116=>• float
           38:107 type_group_063_116=>• fp
           38:108 type_group_063_116=>• flt
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--38--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: type_group_066_117
            grammar index: 39
            bodies:
	39:109 type_group_066_117=>• 32 - 
		39:110 type_group_066_117=>• 64 - 
		39:111 type_group_066_117=>• 128 - 
            compile time: 1.342ms*/;
function $type_group_066_117(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((cmpr_set(l,data,74,2,2)/*[32]*/||cmpr_set(l,data,76,2,2)/*[64]*/)||cmpr_set(l,data,71,3,3)/*[128]*/){
        /*assert*/
        /*assert*/
        /*
           39:109 type_group_066_117=>• 32
           39:110 type_group_066_117=>• 64
           39:111 type_group_066_117=>• 128
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--39--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: type
            grammar index: 40
            bodies:
	40:112 type=>• identifier - 
		40:113 type=>• type_group_053_114 type_group_058_115 sym_group_047_113 - 
		40:114 type=>• type_group_063_116 type_group_066_117 sym_group_047_113 - 
		40:115 type=>• string - 
		40:116 type=>• str - 
		40:117 type=>• type_group_053_114 type_group_058_115 - 
		40:118 type=>• type_group_063_116 type_group_066_117 - 
            compile time: 217.584ms*/;
function $type(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(defined_token_76027f038238d69d(l,data)/*[string] [str]*/){
        /*assert*/
        /*assert*/
        /*
           40:115 type=>• string
           40:116 type=>• str
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--40--DO-NOT-REPLACE*/
            return state;
        }
    } else if(defined_token_36355867e1260ecf(l,data)/*[float] [fp] [flt]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           40:114 type=>• type_group_063_116 type_group_066_117 sym_group_047_113
           40:118 type=>• type_group_063_116 type_group_066_117
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$type_group_063_116(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               40:114 type=>• type_group_063_116 type_group_066_117 sym_group_047_113
               40:118 type=>• type_group_063_116 type_group_066_117
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$type_group_066_117(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   40:114 type=>type_group_063_116 • type_group_066_117 sym_group_047_113
                   40:118 type=>type_group_063_116 • type_group_066_117
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
                if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
                    /*assert-production-closure*/
                    /*assert-production-closure*/
                    /*
                       40:114 type=>type_group_063_116 type_group_066_117 • sym_group_047_113
                    */
                    /*peek_level:-1 offset:4*/
                    /*---leaf-assert-production-closure----*/
                    if(state=$sym_group_047_113(l,data,state)){
                        /*--unique-id--40--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,30);
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*assert-end*/
                    /*
                       40:118 type=>type_group_063_116 type_group_066_117 •
                    */
                    /*peek_level:0 offset:5*/
                    /*---leaf-assert-end----*/
                    /*--unique-id--40--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,30);
                    return state;
                }
            }
        }
    } else if(defined_token_44988bc5e23c2dbb(l,data)/*[uint] [unsigned]*/||defined_token_890e635c95d9af32(l,data)/*[int] [integer]*/){
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           40:113 type=>• type_group_053_114 type_group_058_115 sym_group_047_113
           40:117 type=>• type_group_053_114 type_group_058_115
        */
        /*peek_level:-1 offset:2 -- clause*/
        sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
        if(state=$type_group_053_114(l,data,state)){
            /*assert*/
            /*assert*/
            /*
               40:113 type=>• type_group_053_114 type_group_058_115 sym_group_047_113
               40:117 type=>• type_group_053_114 type_group_058_115
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$type_group_058_115(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   40:113 type=>type_group_053_114 • type_group_058_115 sym_group_047_113
                   40:117 type=>type_group_053_114 • type_group_058_115
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
                if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
                    /*assert-production-closure*/
                    /*assert-production-closure*/
                    /*
                       40:113 type=>type_group_053_114 type_group_058_115 • sym_group_047_113
                    */
                    /*peek_level:-1 offset:4*/
                    /*---leaf-assert-production-closure----*/
                    if(state=$sym_group_047_113(l,data,state)){
                        /*--unique-id--40--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,30);
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*assert-end*/
                    /*
                       40:117 type=>type_group_053_114 type_group_058_115 •
                    */
                    /*peek_level:0 offset:5*/
                    /*---leaf-assert-end----*/
                    /*--unique-id--40--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,30);
                    return state;
                }
            }
        }
    } else {
        /*peek-production-closure*/
        /*peek-production-closure*/
        /*
           40:112 type=>• identifier
        */
        /*peek_level:0 offset:0*/
        /*---leaf-peek-production-closure----*/
        if(state=$identifier(l,data,state)){
            /*--unique-id--40--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: value
            grammar index: 41
            bodies:
	41:119 value=>• θnum - 
		41:120 value=>• tk:string - 
		41:121 value=>• true - 
		41:122 value=>• false - 
		41:123 value=>• null - 
            compile time: 2.485ms*/;
function $value(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((((string_tok_d22ac129e6fa2247(l,data)||cmpr_set(l,data,78,4,4)/*[true]*/)||cmpr_set(l,data,94,5,5)/*[false]*/)||cmpr_set(l,data,29,4,4)/*[null]*/)||l.isNum(data)){
        /*assert*/
        /*assert*/
        /*
           41:119 value=>• θnum
           41:120 value=>• tk:string
           41:121 value=>• true
           41:122 value=>• false
           41:123 value=>• null
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--41--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: string_group_080_118
            grammar index: 42
            bodies:
	42:124 string_group_080_118=>• θws - 
		42:125 string_group_080_118=>• θnl - 
		42:126 string_group_080_118=>• θid - 
		42:127 string_group_080_118=>• θsym - 
		42:128 string_group_080_118=>• \" - 
            compile time: 1.497ms*/;
function $string_group_080_118(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((((cmpr_set(l,data,11,2,2)/*[\"]*/||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        /*assert*/
        /*assert*/
        /*
           42:124 string_group_080_118=>• θws
           42:125 string_group_080_118=>• θnl
           42:126 string_group_080_118=>• θid
           42:127 string_group_080_118=>• θsym
           42:128 string_group_080_118=>• \"
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--42--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: string_HC_listbody1_119
            grammar index: 43
            bodies:
	43:129 string_HC_listbody1_119=>• string_HC_listbody1_119 string_group_080_118 - 
		43:130 string_HC_listbody1_119=>• string_group_080_118 - 
            compile time: 3.515ms*/;
function $string_HC_listbody1_119(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$string_group_080_118(l,data,state)){
        /*--unique-id--43--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 43;
        while(1){
            sk_03fa1f203f1dd7e8(l/*[ 55 ]*/,data);
            if(l.current_byte==34/*["]*/){
                return state;
            }
            /*peek_level:0 offset:0 -- clause*/
            if((((cmpr_set(l,data,11,2,2)/*[\"]*/||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   43:129 string_HC_listbody1_119=>string_HC_listbody1_119 • string_group_080_118
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$string_group_080_118(l,data,state)){
                    /*--unique-id--43--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 43;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==43);
}
/*production name: string
            grammar index: 44
            bodies:
	44:131 string=>• " string_HC_listbody1_119 " - 
		44:132 string=>• " " - 
            compile time: 3.152ms*/;
function $string(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           44:131 string=>" • string_HC_listbody1_119 "
           44:132 string=>" • "
        */
        /*peek_level:0 offset:1 -- clause*/
        sk_03fa1f203f1dd7e8(l/*[ 55 ]*/,data);
        if(l.current_byte==34/*["]*/){
            /*assert*/
            /*assert*/
            /*
               44:132 string=>" • "
            */
            /*peek_level:-1 offset:1*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                /*--unique-id--44--DO-NOT-REPLACE*/
                add_reduce(state,data,2,0);
                return state;
            }
        } else {
            /*peek-production-closure*/
            /*peek-production-closure*/
            /*
               44:131 string=>" • string_HC_listbody1_119 "
            */
            /*peek_level:0 offset:1*/
            /*---leaf-peek-production-closure----*/
            if(state=$string_HC_listbody1_119(l,data,state)){
                sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
                if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
                    /*--unique-id--44--DO-NOT-REPLACE*/
                    add_reduce(state,data,3,0);
                    return state;
                }
            }
        }
    }
    return 0;
}
/*production name: modifier
            grammar index: 45
            bodies:
	45:133 modifier=>• pub - 
		45:134 modifier=>• priv - 
		45:135 modifier=>• export - 
		45:136 modifier=>• mut - 
		45:137 modifier=>• imut - 
		45:138 modifier=>• θid - 
            compile time: 1.882ms*/;
function $modifier(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(l.isUniID(data)){
        /*assert*/
        /*assert*/
        /*
           45:133 modifier=>• pub
           45:134 modifier=>• priv
           45:135 modifier=>• export
           45:136 modifier=>• mut
           45:137 modifier=>• imut
           45:138 modifier=>• θid
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--45--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: identifier
            grammar index: 46
            bodies:
	46:139 identifier=>• tk:identifier_token - 
            compile time: 1.083ms*/;
function $identifier(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(identifier_token_tok_c3af7d2e4e300f22(l,data)&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           46:139 identifier=>tk:identifier_token •
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        /*--unique-id--46--DO-NOT-REPLACE*/
        return state;
    }
    return 0;
}
/*production name: identifier_token_group_091_120
            grammar index: 47
            bodies:
	47:140 identifier_token_group_091_120=>• θid - 
		47:141 identifier_token_group_091_120=>• _ - 
		47:142 identifier_token_group_091_120=>• $ - 
            compile time: 1.177ms*/;
function $identifier_token_group_091_120(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*assert*/
        /*assert*/
        /*
           47:140 identifier_token_group_091_120=>• θid
           47:141 identifier_token_group_091_120=>• _
           47:142 identifier_token_group_091_120=>• $
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--47--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: identifier_token_group_094_121
            grammar index: 48
            bodies:
	48:143 identifier_token_group_094_121=>• g:id - 
		48:144 identifier_token_group_094_121=>• _ - 
		48:145 identifier_token_group_094_121=>• $ - 
            compile time: 1.593ms*/;
function $identifier_token_group_094_121(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((cmpr_set(l,data,15,4,4)/*[g:id]*/||(l.current_byte==95/*[_]*/))||(l.current_byte==36/*[$]*/)){
        /*assert*/
        /*assert*/
        /*
           48:143 identifier_token_group_094_121=>• g:id
           48:144 identifier_token_group_094_121=>• _
           48:145 identifier_token_group_094_121=>• $
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--48--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: identifier_token_HC_listbody1_122
            grammar index: 49
            bodies:
	49:146 identifier_token_HC_listbody1_122=>• identifier_token_HC_listbody1_122 identifier_token_group_094_121 - 
		49:147 identifier_token_HC_listbody1_122=>• identifier_token_group_094_121 - 
            compile time: 3.785ms*/;
function $identifier_token_HC_listbody1_122(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$identifier_token_group_094_121(l,data,state)){
        /*--unique-id--49--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 49;
        while(1){
            sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
            if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
                return state;
            }
            /*peek_level:0 offset:0 -- clause*/
            if((cmpr_set(l,data,15,4,4)/*[g:id]*/||(l.current_byte==95/*[_]*/))||(l.current_byte==36/*[$]*/)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   49:146 identifier_token_HC_listbody1_122=>identifier_token_HC_listbody1_122 • identifier_token_group_094_121
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$identifier_token_group_094_121(l,data,state)){
                    /*--unique-id--49--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 49;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==49);
}
/*production name: identifier_token
            grammar index: 50
            bodies:
	50:148 identifier_token=>• identifier_token_group_091_120 identifier_token_HC_listbody1_122 sym_group_047_113 - 
		50:149 identifier_token=>• identifier_token_group_091_120 sym_group_047_113 - 
		50:150 identifier_token=>• identifier_token_group_091_120 identifier_token_HC_listbody1_122 - 
		50:151 identifier_token=>• identifier_token_group_091_120 - 
            compile time: 182.782ms*/;
function $identifier_token(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(state=$identifier_token_group_091_120(l,data,state)){
        /*assert*/
        /*assert*/
        /*
           50:148 identifier_token=>• identifier_token_group_091_120 identifier_token_HC_listbody1_122 sym_group_047_113
           50:149 identifier_token=>• identifier_token_group_091_120 sym_group_047_113
           50:150 identifier_token=>• identifier_token_group_091_120 identifier_token_HC_listbody1_122
           50:151 identifier_token=>• identifier_token_group_091_120
        */
        /*peek_level:0 offset:1 -- clause*/
        sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
        if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
            /*peek-production-closure*/
            /*peek-production-closure*/
            /*
               50:149 identifier_token=>identifier_token_group_091_120 • sym_group_047_113
            */
            /*peek_level:0 offset:1*/
            /*---leaf-peek-production-closure----*/
            if(state=$sym_group_047_113(l,data,state)){
                /*--unique-id--50--DO-NOT-REPLACE*/
                add_reduce(state,data,2,0);
                return state;
            }
        } else if((cmpr_set(l,data,15,4,4)/*[g:id]*/||(l.current_byte==95/*[_]*/))||(l.current_byte==36/*[$]*/)){
            /*peek-production-closure*/
            /*peek-production-closure*/
            /*
               50:148 identifier_token=>identifier_token_group_091_120 • identifier_token_HC_listbody1_122 sym_group_047_113
               50:150 identifier_token=>identifier_token_group_091_120 • identifier_token_HC_listbody1_122
            */
            /*peek_level:-1 offset:3 -- clause*/
            sk_01ebdfddd6029592(l/*[ ws ][ nl ][ 55 ]*/,data);
            if(state=$identifier_token_HC_listbody1_122(l,data,state)){
                /*assert*/
                /*assert*/
                /*
                   50:148 identifier_token=>identifier_token_group_091_120 • identifier_token_HC_listbody1_122 sym_group_047_113
                   50:150 identifier_token=>identifier_token_group_091_120 • identifier_token_HC_listbody1_122
                */
                /*peek_level:-1 offset:4 -- clause*/
                sk_abe0181f4c01660d(l/*[ nl ][ 55 ]*/,data);
                if(non_capture_222b6b2ad90aaec0(l)/*[ws]*/){
                    /*assert-production-closure*/
                    /*assert-production-closure*/
                    /*
                       50:148 identifier_token=>identifier_token_group_091_120 identifier_token_HC_listbody1_122 • sym_group_047_113
                    */
                    /*peek_level:-1 offset:4*/
                    /*---leaf-assert-production-closure----*/
                    if(state=$sym_group_047_113(l,data,state)){
                        /*--unique-id--50--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,0);
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*assert-end*/
                    /*
                       50:150 identifier_token=>identifier_token_group_091_120 identifier_token_HC_listbody1_122 •
                    */
                    /*peek_level:0 offset:5*/
                    /*---leaf-assert-end----*/
                    /*--unique-id--50--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,0);
                    return state;
                }
            }
        } else {
            /*assert-end*/
            /*assert-end*/
            /*
               50:151 identifier_token=>identifier_token_group_091_120 •
            */
            /*peek_level:0 offset:2*/
            /*---leaf-assert-end----*/
            /*--unique-id--50--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: comment_group_099_123
            grammar index: 51
            bodies:
	51:152 comment_group_099_123=>• θid - 
		51:153 comment_group_099_123=>• θsym - 
		51:154 comment_group_099_123=>• θnum - 
            compile time: 0.931ms*/;
function $comment_group_099_123(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        /*assert*/
        /*assert*/
        /*
           51:152 comment_group_099_123=>• θid
           51:153 comment_group_099_123=>• θsym
           51:154 comment_group_099_123=>• θnum
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-assert----*/
        consume(l,data,state);
        {
            /*--unique-id--51--DO-NOT-REPLACE*/
            return state;
        }
    }
    return 0;
}
/*production name: comment_HC_listbody1_124
            grammar index: 52
            bodies:
	52:155 comment_HC_listbody1_124=>• comment_HC_listbody1_124 comment_group_099_123 - 
		52:156 comment_HC_listbody1_124=>• comment_group_099_123 - 
            compile time: 1.768ms*/;
function $comment_HC_listbody1_124(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$comment_group_099_123(l,data,state)){
        /*--unique-id--52--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 52;
        while(1){
            sk_5bef380e54687dea(l/*[ ws ][ nl ]*/,data);
            if(cmpr_set(l,data,20,undefined,2)/*[asterisk/]*/){
                return state;
            }
            /*peek_level:0 offset:0 -- clause*/
            if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   52:155 comment_HC_listbody1_124=>comment_HC_listbody1_124 • comment_group_099_123
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$comment_group_099_123(l,data,state)){
                    /*--unique-id--52--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 52;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==52);
}
/*production name: comment_HC_listbody1_125
            grammar index: 53
            bodies:
	53:157 comment_HC_listbody1_125=>• comment_HC_listbody1_125 comment_group_099_123 - 
		53:158 comment_HC_listbody1_125=>• comment_group_099_123 - 
            compile time: 7.214ms*/;
function $comment_HC_listbody1_125(l,data,state){
    let prod = -1;
    /*peek_level:-1 offset:0*/
    /*---leaf-assert-production-closure----*/
    if(state=$comment_group_099_123(l,data,state)){
        /*--unique-id--53--DO-NOT-REPLACE*/
        add_reduce(state,data,1,2);
        prod = 53;
        while(1){
            sk_af14aaaa4a0a14a1(l/*[ ws ]*/,data);
            if(non_capture_6c6329e8ba3f5e20(l)/*[nl]*/){
                return state;
            }
            /*peek_level:0 offset:0 -- clause*/
            if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
                /*peek-production-closure*/
                /*peek-production-closure*/
                /*
                   53:157 comment_HC_listbody1_125=>comment_HC_listbody1_125 • comment_group_099_123
                */
                /*peek_level:0 offset:1*/
                /*---leaf-peek-production-closure----*/
                if(state=$comment_group_099_123(l,data,state)){
                    /*--unique-id--53--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,1);
                    prod = 53;
                    continue;
                }
            }
            break;
        }
    }
    return assertSuccess(l,state,prod==53);
}
/*production name: comment_group_0104_126
            grammar index: 54
            bodies:
	54:159 comment_group_0104_126=>• θnl - 
            compile time: 0.882ms*/;
function $comment_group_0104_126(l,data,state){
    /*peek_level:-1 offset:0 -- clause*/
    if(non_capture_6c6329e8ba3f5e20(l)/*[nl]*/&&consume(l,data,state)){
        /*consume*/
        /*consume*/
        /*
           54:159 comment_group_0104_126=>θnl •
        */
        /*peek_level:-1 offset:0*/
        /*---leaf-consume----*/
        /*--unique-id--54--DO-NOT-REPLACE*/
        return state;
    }
    return 0;
}
/*production name: comment
            grammar index: 55
            bodies:
	55:160 comment=>• /* comment_HC_listbody1_124 * / - 
		55:161 comment=>• // comment_HC_listbody1_125 comment_group_0104_126 - 
		55:162 comment=>• /* * / - 
		55:163 comment=>• // comment_group_0104_126 - 
            compile time: 3.381ms*/;
function $comment(l,data,state){
    /*peek_level:0 offset:0 -- clause*/
    if(cmpr_set(l,data,19,2,2)/*[/asterisk]*/){
        /*peek*/
        /*peek*/
        /*
           55:160 comment=>• /* comment_HC_listbody1_124 * /
           55:162 comment=>• /* * /
        */
        /*peek_level:1 offset:0 -- clause*/
        let pk = l.copy();
        sk_5bef380e54687dea(pk.next(data)/*[ ws ][ nl ]*/,data);
        if(cmpr_set(pk,data,20,undefined,2)/*[asterisk/]*/){
            /*assert*/
            /*assert*/
            /*
               55:162 comment=>• /* * /
            */
            /*peek_level:1 offset:0*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                sk_5bef380e54687dea(l/*[ ws ][ nl ]*/,data);
                if(cmpr_set(l,data,20,undefined,2)/*[asterisk/]*/&&consume(l,data,state)){
                    /*--unique-id--55--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,0);
                    return state;
                }
            }
        } else {
            /*assert*/
            /*assert*/
            /*
               55:160 comment=>• /* comment_HC_listbody1_124 * /
            */
            /*peek_level:1 offset:0*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                sk_5bef380e54687dea(l/*[ ws ][ nl ]*/,data);
                if(state=$comment_HC_listbody1_124(l,data,state)){
                    sk_5bef380e54687dea(l/*[ ws ][ nl ]*/,data);
                    if(cmpr_set(l,data,20,undefined,2)/*[asterisk/]*/&&consume(l,data,state)){
                        /*--unique-id--55--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,0);
                        return state;
                    }
                }
            }
        }
    } else if(cmpr_set(l,data,86,2,2)/*[//]*/){
        /*peek*/
        /*peek*/
        /*
           55:161 comment=>• // comment_HC_listbody1_125 comment_group_0104_126
           55:163 comment=>• // comment_group_0104_126
        */
        /*peek_level:1 offset:0 -- clause*/
        let pk = l.copy();
        sk_af14aaaa4a0a14a1(pk.next(data)/*[ ws ]*/,data);
        if(non_capture_6c6329e8ba3f5e20(pk)/*[nl]*/){
            /*assert*/
            /*assert*/
            /*
               55:163 comment=>• // comment_group_0104_126
            */
            /*peek_level:1 offset:0*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                sk_af14aaaa4a0a14a1(l/*[ ws ]*/,data);
                if(state=$comment_group_0104_126(l,data,state)){
                    /*--unique-id--55--DO-NOT-REPLACE*/
                    add_reduce(state,data,2,0);
                    return state;
                }
            }
        } else {
            /*assert*/
            /*assert*/
            /*
               55:161 comment=>• // comment_HC_listbody1_125 comment_group_0104_126
            */
            /*peek_level:1 offset:0*/
            /*---leaf-assert----*/
            consume(l,data,state);
            {
                sk_5bef380e54687dea(l/*[ ws ][ nl ]*/,data);
                if(state=$comment_HC_listbody1_125(l,data,state)){
                    sk_af14aaaa4a0a14a1(l/*[ ws ]*/,data);
                    if(state=$comment_group_0104_126(l,data,state)){
                        /*--unique-id--55--DO-NOT-REPLACE*/
                        add_reduce(state,data,3,0);
                        return state;
                    }
                }
            }
        }
    }
    return 0;
}
function recognizer(data,production){
    let l = new Lexer();
    l.next(data);
    sk_ea7f40a22e099bd2(l/*[ ws ][ nl ][ 55 ]*/,data);
    $skribble(l,data,createState(1));
}


    function delete_data(){};
    ;
        return { recognizer, init_data, init_table, delete_data };
    });

const fns = [(e,sym)=>sym[sym.length-1], 
(env, sym, pos)=>( (sym[0].push(sym[1]),sym[0]))/*0*/
,(env, sym, pos)=>( [sym[0]])/*1*/
,(env, sym, pos)=>( {type:"name_space",name:sym[1],statements:sym[3]})/*2*/
,(env, sym, pos)=>( {type:"name_space",name:sym[1]})/*3*/
,(env, sym, pos)=>( {type:"data_structure",name:sym[2],modifiers:sym[0]||[],properties:sym[4]||[]})/*4*/
,(env, sym, pos)=>( {type:"data_structure",name:sym[1],modifiers:[],properties:sym[3]||[]})/*5*/
,(env, sym, pos)=>( {type:"data_structure",name:sym[2],modifiers:sym[0]||[],properties:[]})/*6*/
,(env, sym, pos)=>( {type:"data_structure",name:sym[1],modifiers:[],properties:[]})/*7*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],arguments:sym[6]||[],expressions:sym[9]||[]})/*8*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],arguments:sym[5]||[],expressions:sym[8]||[]})/*9*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],arguments:[],expressions:sym[8]||[]})/*10*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],arguments:sym[6]||[],expressions:[]})/*11*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],arguments:[],expressions:sym[7]||[]})/*12*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],arguments:sym[5]||[],expressions:[]})/*13*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],arguments:[],expressions:[]})/*14*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],arguments:[],expressions:[]})/*15*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],arguments:sym[5]||[],expressions:sym[8]||[]})/*16*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],arguments:sym[4]||[],expressions:sym[7]||[]})/*17*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],arguments:[],expressions:sym[7]||[]})/*18*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],arguments:sym[5]||[],expressions:[]})/*19*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],arguments:[],expressions:sym[6]||[]})/*20*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],arguments:sym[4]||[],expressions:[]})/*21*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],arguments:[],expressions:[]})/*22*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],arguments:[],expressions:[]})/*23*/
,(env, sym, pos)=>( (sym[0].push(sym[2]),sym[0]))/*24*/
,(env, sym, pos)=>( {type:sym[3],name:sym[1],modifiers:sym[0]||[]})/*25*/
,(env, sym, pos)=>( {type:sym[2],name:sym[0],modifiers:[]})/*26*/
,(env, sym, pos)=>( sym[1])/*27*/
,(env, sym, pos)=>( sym[0].list?(sym[0].list.push(sym[1],sym[2]),sym[0]):{type:"symboled_expressions",list:[...([sym[0]]),sym[1],sym[2]]})/*28*/
,(env, sym, pos)=>( sym[0]+sym[1])/*29*/
,(env, sym, pos)=>( sym[0]+"")/*30*/
,(env, sym, pos)=>( sym[0])/*31*/]; 
export { fns as parser_functions, data as parser_data };
export default ParserFactory(fns, undefined, data)