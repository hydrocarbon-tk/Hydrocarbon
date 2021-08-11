/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TokenTypes } from "../runtime/TokenTypes.js";
import { parser } from "../skribble/skribble.js";
import { SKModule } from "../skribble/types/node.js";

export const NULL_STATE = 0;
export const UNICODE_ID_CONTINUE = 32;
export const UNICODE_ID_START = 64;
export const STATE_ALLOW_SKIP = 1;
export const STATE_ALLOW_OUTPUT = 2;
export const renderSkribbleRecognizer = (): SKModule => {
    const val = <SKModule>parser(`

[static] action_ptr: u32 = 0;
[static pub] data_array_len :u32 = 0;
[static pub] fork_array_len :u32 = 0;
[pub] root_data: __ParserData$ptr = 0;
[pub] tip_data: __ParserData$ptr = 0;
[pub static new] data_array : array___ParserData$ptr = Array(64);
[pub static new] fork_array : array___DataRef$ptr = Array(64);
[pub static new] out_array : array___ParserData$ptr = Array(64);
[pub] out_array_len :u32 = 0;

fn getUTF8ByteLengthFromCodePoint : u32(code_point : u32){

    if (code_point) == 0:{
        return: 1;
   } else if (code_point & 0x7F) == code_point : {
        return: 1;
    } else if (code_point & 0x7FF) == code_point : {
        return: 2;
    } else if (code_point & 0xFFFF) == code_point : {
        return: 3;
    } else {
        return: 4;
    }
}

fn  utf8ToCodePoint : u32 (index:u32, buffer: array_u8){
    [mut] a: u8 = buffer[index];
    [mut] flag: u8 = 14;

    if a & 0x80 : {
    
        flag = a & 0xF0;

        [const] b:u8 = buffer[index+1];

        if flag & 0xE0 : {

            flag = a & 0xF8;

            [const] c:u8 = buffer[index+2];

            if (flag) == 0xF0 : {
                return: ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index+3] & 0x3F);
            } else if (flag) == 0xE0 : {
                return: ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
            }

        } else if (flag) == 0xC : {
            return: ((a & 0x1F) << 6) | b & 0x3F;
        }

    } else return: a;

    return:0;

}

fn getTypeAt : u32 ( code_point : u32 ) {

    return : (char_lu_table[code_point] & 0x1F);
}

fn createState:u32 (ENABLE_STACK_OUTPUT:u32) {
    return : ${STATE_ALLOW_SKIP} | (ENABLE_STACK_OUTPUT << 1);
}

[pub wasm]  cls ParserData{
    [pub ptr] lexer: __Lexer$ptr
    [pub] state: u32
    [pub] prod: u32 = 0 
    [pub] stack_ptr: i32 = 0
    [pub] rules_ptr: u32 = 0
    [pub] input_len: u32 = 0
    [pub] rules_len: u32 = 0
    [pub] rules_len: u32 = 0
    [pub] active_token_productions: u32 = 0
    [pub ptr] rules: array_u16
    [pub] input: __u8$ptr
    [pub] sequence: __u8$ptr
    [pub] stack: array_StackFunction = call(256)
    [pub] stash: array_u32 = call(256)
    [pub] origin: __ParserData$ptr
    [pub] next: __ParserData$ptr = 0
    [pub] VALID: bool = 0 
    [pub] COMPLETED: bool = 0 

    [pub]  fn ParserData:ParserData(
        input_buffer: __u8$ptr,
        input_len_in:u32, 
        rules_len_in:u32, 
        lexer_in: __Lexer$ptr
    ){
        this.lexer = lexer_in;
        this.state = createState(1);
        this.prod = 0;
        this.VALID = false;
        this.COMPLETED = false;
        this.stack_ptr = 0;
        this.rules_ptr = 0;
        this.input_len = input_len_in;
        this.rules_len = rules_len_in;
        this.origin_fork = 0;
        [this_] origin:u32 = 0;
        this.input = input_buffer;
        [new this_] rules:array_u16 = array_u16(rules_len_in);
        [new this_ cpp_ignore] stash:array_u32 = array_u32(256);
        [new this_ cpp_ignore] stack:array_any = array_any();
    }

    [pub] fn sync:void(ptr:__ParserData$ptr){
        if (ptr) == this : return;
    }
}

[pub wasm]  cls ParserDataBuffer{

    [pub new] data : array___ParserData$ptr = Array(64)

    [pub] len : i32

    [pub] fn ParserDataBuffer:ParserDataBuffer(){
        this.len = 0;
        [new this_ cpp_ignore] data : array___ParserData$ptr = array_any();
    }


    [pub] fn addDataPointer:void(ptr: __ParserData$ptr){
        this.data[this.len++] = ptr;
    }


    [pub] fn removeDataAtIndex:void(index:i32){
        
        this.len--;

        [mut] j:u32 = index;

        loop (; j < this.len; j++){
            this.data[j] = this.data[j+1];
        };
    }
}

[pub wasm] cls DataRef{

    [pub] ptr: __ParserData$ptr = 0
    [pub] VALID:bool = 0
    [pub] depth:u32 = 0
    [pub] byte_offset:u32 = 0
    [pub] byte_length:u32 = 0
    [pub] line:u32 = 0
    [pub] command_offset:u32 = 0
    [pub] command_block: array_u16 = array_u16(64)

    [pub] fn DataRef:DataRef(
        ptr_in:__ParserData$ptr,
        VALID_in:bool,
        depth_in:u32,
        byte_offset_in: u32,
        byte_length_in: u32,
        line_in: u32
    ){
        this.byte_offset = byte_offset_in;
        this.byte_length = byte_length_in;
        this.line = line_in;
        this.ptr = ptr_in;
        this.VALID = VALID_in;
        this.depth = depth_in;
        this.command_offset = 0;
        [this_ new cpp_ignore] command_block:Uint16Array = Uint16Array(64);
    }
}

[pub wasm] cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] token_offset:u32= 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] prev_byte_offset:u32 = 0
    [pub] type:u32 = 0
    [pub] line:u16 = 0
    [pub] current_byte:u16 = 0

    [pub] fn Lexer : Lexer () { 
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_byte_offset = 0;
        this.type = 0;
        this.line = 0;
        this.current_byte = 0;
    }

    [pub] fn setToken:i32(type_in:i32, byte_length_in:u32, token_length_in:u32){
        this.type = type_in;
        this.byte_length = byte_length_in;
        this.token_length = token_length_in;
        return :type_in;
    }


    [pub] fn getType : u32 (USE_UNICODE:bool, data: __ParserData$ref) { 

        [mut] t:u32 = this.type;

        if this.END(data) : return : ${TokenTypes.END_OF_FILE};

        if (t) == 0 :{
            if ( !(USE_UNICODE) || this.current_byte < 128) :{
                t = getTypeAt(this.current_byte)
           } else {
                [const] code_point:u32 = utf8ToCodePoint(this.byte_offset, data.input);
                this.byte_length = getUTF8ByteLengthFromCodePoint(code_point);
                t = getTypeAt(code_point);
            }
        };

        return : t;
    }

    [pub] fn isSym : bool (USE_UNICODE:bool, data:__ParserData$ref) {
        if((this.type) == 0 && this.getType(USE_UNICODE, data) == ${TokenTypes.SYMBOL}): {
            this.type = ${TokenTypes.SYMBOL};
        };

        return : (this.type )== ${TokenTypes.SYMBOL};
    }

    [pub] fn isNL : bool () {

        if((this.type) == 0 && ( this.current_byte) == 10 || (this.current_byte) == 13 ): {
            this.type = ${TokenTypes.NEW_LINE};
        };

        return : (this.type )== ${TokenTypes.NEW_LINE};
    }

    [pub] fn isSP : bool  (USE_UNICODE:bool, data:__ParserData$ref) {
        
        if((this.type) == 0 && (this.current_byte) == 32): {
            this.type = ${TokenTypes.SPACE}
        };

        return : (this.type )== ${TokenTypes.SPACE}
    }

    [pub] fn isNum : bool  (data:__ParserData$ref) {
        if (this.type) == 0 : {
            if this.getType(false, data) == ${TokenTypes.NUMBER} : {

                [const] l :u32 = data.input_len;

                [mut] off : u32 = this.byte_offset;

                loop ((off++ < l) && 47 < data.input[off] && data.input[off] < 58)  {
                    this.byte_length += 1;  
                    this.token_length += 1;
                };

                this.type = ${TokenTypes.NUMBER};
                
                return : true

            } else 
                return : false
        } else 
            return : (this.type) == ${TokenTypes.NUMBER}
    }

    [pub] fn isUniID : bool  (data:__ParserData$ref) {
        
        if ((this.type) == 0 ) : {

            if (this.getType(true, data) ==  ${TokenTypes.IDENTIFIER}) : {

                [const] l :u32 = data.input_len;

                [mut]  off:u32  = this.byte_offset;

                prev_byte_len:u32  = this.byte_length;

                loop ( (off + this.byte_length) < l)  {
                    [const] code_point: u32 = utf8ToCodePoint(this.byte_offset + this.byte_length, data.input);

                    if( ((${UNICODE_ID_CONTINUE | UNICODE_ID_START}) & char_lu_table[code_point]) > 0) : {
                        this.byte_length += getUTF8ByteLengthFromCodePoint(code_point);
                        prev_byte_len = this.byte_length;
                        this.token_length += 1;
                    } else {
                        break;
                    }
                };

                this.byte_length = prev_byte_len;

                this.type = ${TokenTypes.IDENTIFIER};

                return:  true;
            }  else 
                return: false
        } else 
            return: (this.type) == ${TokenTypes.IDENTIFIER};
    }

    [pub] fn copy: __Lexer$ptr (){

        [const new] destination : __Lexer$ptr = Lexer();

        [const] destination_ref : __Lexer$ref = *> destination;
        
        destination_ref.byte_offset = this.byte_offset;
        destination_ref.byte_length = this.byte_length;
        
        destination_ref.token_length = this.token_length;
        destination_ref.token_offset = this.token_offset;
        destination_ref.prev_byte_offset = this.prev_byte_offset;
        
        destination_ref.line = this.line;
        destination_ref.byte_length = this.byte_length;
        destination_ref.current_byte = this.current_byte;

        return :destination
    }

    [pub] fn copyInPlace: Lexer (){

        [const local_new] destination : Lexer = Lexer();
        
        destination.byte_offset = this.byte_offset;
        destination.byte_length = this.byte_length;
        
        destination.token_length = this.token_length;
        destination.token_offset = this.token_offset;
        destination.prev_byte_offset = this.prev_byte_offset;
        
        destination.line = this.line;
        destination.byte_length = this.byte_length;
        destination.current_byte = this.current_byte;

        return :destination
    }

    [pub] fn sync:__Lexer$ref (source: __Lexer$ref){
        
        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_byte_offset = source.prev_byte_offset;
        
        this.line = source.line;
        this.type = source.type;
        this.current_byte = source.current_byte;

        return:*> this;
    }

    [pub] fn slice:__Lexer$ref(source:__Lexer$ref) {
        this.byte_length = this.byte_offset - source.byte_offset;
        this.token_length = this.token_offset - source.token_offset;
        this.byte_offset = source.byte_offset;
        this.token_offset = source.token_offset;
        this.current_byte = source.current_byte;
        this.line = source.line;
        this.type = source.type;
        return:*>this;
    }

    [pub] fn next:__Lexer$ref (data: __ParserData$ref){
            
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;
        
        if(data.input_len <= this.byte_offset) :{
            this.type = ${TokenTypes.END_OF_FILE};
            this.byte_length = 0;
            this.token_length = 0;
            this.current_byte = 0;
        }else{
            this.current_byte = data.input[this.byte_offset];
            if (this.current_byte) == 10:
                this.line += 1;
            this.type = 0;
            this.byte_length = 1;
            this.token_length = 1;
        };

        return :*> this;
    }
    
    [pub] fn END:bool (data:__ParserData$ref){
        return : this.byte_offset >= data.input_len
    }
}

fn token_production:bool(l:__Lexer$ref, data:__ParserData$ref, production:StackFunction, pid:u32, type:u32, tk_flag:u32){       

    if (l.type) == type : return : true;   
    
    if (data.active_token_productions & tk_flag) : return : false;     
    
    data.active_token_productions |= tk_flag;
        
    // preserve the current state of the data
    [const] stack_ptr :u32 = data.stack_ptr;
    [const] state:u32 = data.state;
    [mut new cpp_ignore] data_buffer : ParserDataBuffer = ParserDataBuffer();
    [mut js_ignore] data_buffer : ParserDataBuffer;

    pushFN(data, production, 0);

    data.state = ${NULL_STATE};

    data.active_token_productions ^= tk_flag;

    [mut]ACTIVE:bool = true;

    loop ( (ACTIVE) ) {
        ACTIVE = stepKernel(data, l, data_buffer, stack_ptr + 1);
    };

    data.state = state;

    if data.prod ~= pid : {
        data.stack_ptr = stack_ptr;
        l.slice(copy);
        l.type = type;
        return: true;
    } else {
        data.stack_ptr = stack_ptr;
        l.sync(copy);
        return: false;
    };
    
    return: false;
}


// Compare ----------------------------------------------------------------------------------------------

fn compare: u32(
    data: __ParserData$ref,
    data_offset: u32,
    sequence_offset:u32,
    byte_length: u32,
    sequence: __u8$ptr
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = sequence_offset;
    [const] len:u32 = j+byte_length;

    loop(;j<len; i++, j++)
        if(data.input[i] != sequence[j] ) : return : j - sequence_offset;

    return : byte_length;
}

fn create_parser_data_object:__ParserData$ptr(
    input_buffer: __u8$ptr, input_len:u32, rules_len:u32
){
    [mut new] lexer: __Lexer$ptr = Lexer();

    [static new]parser_data:__ParserData$ptr = ParserData(input_buffer, input_len, rules_len,  lexer);

    return : parser_data
}

[ptr] fn fork:__ParserData$ptr(
    data:__ParserData$ref,
    data_buffer:__ParserDataBuffer$ref
) {

    [mut] fork:__ParserData$ptr = create_parser_data_object(
        data.input, 
        data.input_len,
        data.rules_len - data.rules_ptr
    );

    (*>tip_data).next = fork;
    tip_data = fork;

    fork_ref:__ParserData$ref = *>fork;

    [mut] i:u32 = 0;
    
    loop (; i < data.stack_ptr + 1; i++)  {
        fork_ref.stash[i] = data.stash[i];
        fork_ref.stack[i] = data.stack[i];
    };

    fork_ref.stack_ptr = data.stack_ptr;
    fork_ref.active_token_productions = data.active_token_productions;
    fork_ref.origin_fork = data.rules_ptr + data.origin_fork;
    fork_ref.origin = &>data;
    fork_ref.lexer = (*>data.lexer).copy();
    fork_ref.state = data.state;
    fork_ref.prod = data.prod;

    data_buffer.addDataPointer(fork);

    return :fork; 
}

fn isOutputEnabled:bool (state:u32) { return: ${NULL_STATE} != (state & ${STATE_ALLOW_OUTPUT}) }

fn set_action:void (val:u32, data:__ParserData$ref) {
    if(data.rules_ptr > data.rules_len) : return;
    data.rules[data.rules_ptr++] = val;
}

fn add_reduce:void(state:u32, data:__ParserData$ref, sym_len:u32, body:u32 = 0, DNP:bool = false) {
    if isOutputEnabled(state) : {

        [mut] total:u32 = body + sym_len;

        if (total) == 0 : return;
    
        if body > 0xFF || sym_len > 0x1F : {
            
            [const] low:u32 = (1 << 2) | ( body << 3);
            
            [const] high:u32 = sym_len;

            set_action(low, data);
            
            set_action(high, data);

        } else {
            
            [const] low:u32 = ((sym_len & 0x1F) << 3) | ( (body & 0xFF) << 8);
            
            set_action(low, data);
        }
    }
}

fn add_shift:void(data:__ParserData$ref, tok_len:u32) {

    if tok_len < 0 : return;
    
    if tok_len > 0x1FFF : {
        [const] low:u32 = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
        [const] high:u32 = (tok_len & 0xFFFF);
        set_action(low, data);
        set_action(high, data);
    } else {
        [const] low:u32 = 1 | ((tok_len << 3) & 0xFFF8);
        set_action(low, data);
    }
}

fn add_skip:void(data:__ParserData$ref, skip_delta:u32){

    if skip_delta < 1: return;
    
    if skip_delta > 0x1FFF:{
        [const] low:u32 = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
        [const] high:u32 = (skip_delta & 0xFFFF);
        set_action(low, data);
        set_action(high, data);
    } else {
        [const] low:u32 = 2 | ((skip_delta << 3) & 0xFFF8);
        set_action(low, data);
    }
}

[pub] fn mark:u32 (val:u32, data:__ParserData$ref) { return:action_ptr }

fn reset:void (data:__ParserData$ref, origin:__Lexer$ref, s_ptr:u32, r_ptr:u32) {
    data.rules_ptr = r_ptr;
    data.stack_ptr = s_ptr;
    (*>data.lexer).sync(origin);
}

fn consume: bool (l:__Lexer$ref, data:__ParserData$ref, state:u32) {
    l.prev_byte_offset = l.byte_offset + l.byte_length;
    if isOutputEnabled(state) : add_shift(data, l.token_length);
    l.next(data);
    return:true
}

fn pushFN:void(
    data:__ParserData$ref, 
    [pub] _fn_ref: StackFunction,
    stash: i32
){ 
    data.stack[++data.stack_ptr] = _fn_ref; 
    data.stash[data.stack_ptr] = stash; 
    data.stash[data.stack_ptr + 1] = stash;
}

fn stepKernel:bool(
    data:__ParserData$ref, 
    lexer:__Lexer$ref, 
    data_buffer:__ParserDataBuffer$ref, 
    stack_base:i32
){
    [mut] ptr:i32 = data.stack_ptr;

    [static] _fn: StackFunction = data.stack[ptr];

    [static] stash:u32 = data.stash[ptr];

    data.stack_ptr--;

    [static] result:i32 = _fn(lexer, data, data_buffer, data.state, data.prod, stash);
    
    data.prod = result;

    if(result<0 || data.stack_ptr < stack_base) : {
        return:false;
    };

    return :true
}

fn insertData:i32(
    data:__ParserData$ptr, 
    resolved:__ParserData$ptr$ptr, 
    resolved_len:i32, 
    resolved_max:i32
){
    
    [const] in_ref:__ParserData$ref =  *>data;
    
    [mut]index:u32 =0;

    loop( ; index < resolved_len; index++){
        [const] exist_ref:__ParserData$ref = *>resolved[index];

        if in_ref.VALID && (!exist_ref.VALID): {
            break;
        } else if (!exist_ref.VALID && ((*>(exist_ref.lexer)).byte_offset < (*>(in_ref.lexer)).byte_offset)) :{
            break;
        }
    };

    if (index < resolved_max) : {

        [mut]i:u32 = resolved_len;

        if i > resolved_max - 1 : i = resolved_max - 1;
        
        loop(; i > index; i--){
            resolved[i] = resolved[i-1];
        };

        resolved[index] = data;
    
        return : resolved_len + 1;
    };
    
    return : resolved_max;
}

fn run:i32(origin:__ParserData$ptr,  resolved:__ParserData$ptr$ptr, resolved_len:i32, resolved_max:i32, base:u32, prod_id:u32){

    [mut new cpp_ignore] data_buffer : ParserDataBuffer = ParserDataBuffer();
    [mut js_ignore] data_buffer : ParserDataBuffer;

    data_buffer.addDataPointer(origin);

    loop ( ( data_buffer.len > 0 ) ) {
        
        [const]i:i32 =0;

        loop( ; i < data_buffer.len; i++){

            [const] data:__ParserData$ref = *> data_buffer.data[i];
            
            if (!stepKernel(data, *>data.lexer, data_buffer, base)) : {

                data.COMPLETED = true;

                data.VALID = (data.prod) == prod_id;

                data_buffer.removeDataAtIndex(i--);

                resolved_len = insertData(&>data,
                    resolved,
                    resolved_len,
                    resolved_max
                );
            };
        };
    };

    return : resolved_len 
}

fn clear_data:void () {

    [mut]curr: __ParserData$ptr  = root_data;

    if(curr) : {

        [mut]next: __ParserData$ptr  = (*>curr).next;
        
        loop ( (curr) )  {
            
            next = ((*>curr).next);
            
            %%%% ((*>curr).rules);
            
            **** ((*>curr).lexer);    
            
            **** curr;
            
            curr = next;
        }; 
    };
        
    [mut]i:u32 =0;

    loop( ; i < fork_array_len; i++){
        **** fork_array[i];
    };

    fork_array_len = 0;
    out_array_len = 0;
    data_array_len = 0;
}

fn init_data:void(
    input_buffer: __u8$ptr,
    input_len:u32, 
    rules_len:u32 
){ 
    clear_data();

    [mut] data:__ParserData$ptr = create_parser_data_object(
        input_buffer,
        input_len,
        rules_len
    );

    data_array[0] = data;
}

fn get_fork_pointers:__DataRef$ptr$ptr(){

    [mut] i:u32 = 0;
    loop( ; i < out_array_len; i++){
        [const] data:__ParserData$ref = *> out_array[i];

        [mut new] fork:__DataRef$ptr = DataRef(
            out_array[i],
            (data.VALID),
            (data.origin_fork + data.rules_ptr),
            (*>data.lexer).byte_offset,
            (*>data.lexer).byte_length,
            (*>data.lexer).line
        );

        fork_array_len++;

        fork_array[i] = fork;
    };

    return: fork_array;
}

fn block64Consume:i32(data:__ParserData$ptr, block:array_u16, offset:u32, block_offset:u32, limit:u32) {
    //Find offset block

    [mut] containing_data:__ParserData$ptr = data;
    [mut] end:i32 = (*>containing_data).origin_fork + (*>data).rules_ptr;

    //Find closest root
    loop (((*>containing_data).origin_fork > offset) ){
        end = (*>containing_data).origin_fork;
        containing_data = (*>containing_data).origin;
    };

    [mut] start:i32 = (*>containing_data).origin_fork;

    offset -= start;
    end -= start;

    //Fill block with new data
    [mut] ptr:u32 = offset;

    if (ptr >= end) : return : limit - block_offset;

    loop ((block_offset < limit) ){
        block[block_offset++] = (*>containing_data).rules[ptr++];
        if (ptr >= end) :
            return: block64Consume(data, block, ptr + start, block_offset, limit);
    };

    return: 0;
}

fn get_next_command_block:__u16$ptr(fork:__DataRef$ptr) {

    [const] fork_ref:__DataRef$ref = *>fork;

    [static] remainder:u32 = block64Consume(
        fork_ref.ptr, 
        fork_ref.command_block, 
        fork_ref.command_offset, 
        0, 64);

    fork_ref.command_offset += 64 - remainder;

    if (remainder > 0) :
        fork_ref.command_block[64 - remainder] = 0;

    return : fork_ref.command_block;
}

fn recognize:u32(
    input_byte_length:u32, 
    production:u32,
    [pub] _fn_ref: StackFunction
){
    
    [pub] data_ref:__ParserData$ref = *> data_array[0];
    data_ref.stack[0] = _fn_ref; 
    data_ref.stash[0] = 0;
    data_ref.input_len = input_byte_length;
    
    (*>data_ref.lexer).next(data_ref);

    root_data = &>data_ref;
    tip_data = &>data_ref;
    
    out_array_len = run(&>data_ref, out_array, out_array_len, 64, 0, production);
    
    return: out_array_len;
}`);
    return val;
};