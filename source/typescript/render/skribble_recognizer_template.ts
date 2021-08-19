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

[pub wasm]  cls ParserState{
    [pub] lexer: Lexer

    [pub] state: u32 = 0
    [pub] prod: u32 = 0 
    [pub] active_token_productions: u32 = 0
    
    [pub] VALID: bool = 0 
    [pub] COMPLETED: bool = 0 

    [pub] origin: __ParserState$ptr
    [pub] origin_fork: u32 = 0 
    
    [pub ptr] rules: array_u16
    [pub] rules_ptr: u32 = 0

    [pub] stash: array_u32 = call(256)
    [pub] stack: array_StackFunction = call(256)
    [pub] stack_ptr: i32 = 0
    
    [pub] input: __array_u8$ptr
    [pub] input_len: u32 = 0
    
    [pub] refs: u8 = 0
    

    [pub]  fn ParserState:ParserState(
        input_buffer: __u8$ptr,
        input_len_in:u32
    ){
        
        [new this_ cpp_ignore] lexer:Lexer = Lexer();
        
        this.state = create_state(1);
        this.prod = 0;

        this.VALID = false;
        this.COMPLETED = false;
        this.stack_ptr = 0;
        this.rules_ptr = 0;
        this.input_len = input_len_in;
        
        this.origin = 0;
        this.origin_fork = 0;
        
        this.input = input_buffer;
        
        [new this_] rules:array_u16 = array_u16(rules_len_in);
        
        
        [new this_ cpp_ignore] stash:array_u32 = array_u32(256);
        [new this_ cpp_ignore] stack:array_any = array_any();
    }

    [pub] fn sync:void(ptr:__ParserState$ptr){
        if (ptr) == this : return;
    }

    [pub] fn get_rules_ptr_val:u32(){
        return : this.rules_ptr;
    }

    [pub] fn get_input_len:u32(){
        return : this.input_len;
    }

    [pub] fn get_input_array: __array_u8$ptr (){
        return : this.input_array;
    }

    [pub] fn push_fn:void(_fn_ref: StackFunction, stash_value: i32) {
        this.stack_ptr += 1;
        this.stack[this.stack_ptr] = _fn_ref;
        this.stash[this.stack_ptr] = stash_value;
    }

    [pub] fn get_byte_from_input:i32(index: u32) {
        return : &>self.input[index]
    }
}

[pub wasm]  cls ParserStateBuffer{

    [pub new] data : array___ParserState = Array(64)

    [pub] len : i32

    [pub] fn ParserStateBuffer:ParserStateBuffer(){
        this.len = 0;
        [new this_ cpp_ignore] data : array___ParserState$ptr = array_any();
    }

    [pub] fn addDataPointer:void(ptr: __ParserState){
        this.data[this.len] = ptr;
        this.len += 1;
    }

    [pub] fn removeDataAtIndex:__ParserState(index:i32){
        
        this.len-=1;

        [mut] j:u32 = index;

        [mut] data : __ParserState  = this.data[index];

        loop ((j < this.len)){
            this.data[j] = this.data[j+1];
            j+=1;
        };

        return : data[j]
    }

    [pub] fn addDataPointerSorted:void(
        data:__ParserState
    ){
        
        [mut]index:u32 =0;
    
        loop( (index < resolved_len)){
            [const] exist_ref:__ParserState$ref = *>resolved[index];
    
            if data.VALID && (!exist_ref.VALID): {
                break;
            } else if (!exist_ref.VALID && ((*>(exist_ref.lexer)).byte_offset < data.lexer.byte_offset)) :{
                break;
            };

            index +=1;
        };
    
        if (index < resolved_max) : {
    
            [mut]i:u32 = resolved_len;
    
            if i > resolved_max - 1 : i = resolved_max - 1;
            
            loop( (i > index) ){
                resolved[i] = resolved[i-1];

                i-=1;
            };
    
            resolved[index] = data;
        
            return : resolved_len + 1;
        };
        
        return : resolved_max;
    }
}

[pub wasm] cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] token_offset:u32= 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] prev_byte_offset:u32 = 0
    [pub] _type:u32 = 0
    [pub] line:u16 = 0
    [pub] current_byte:u16 = 0

    [pub] fn setToken:i32(type_in:i32, byte_length_in:u32, token_length_in:u32){
        this._type = type_in;
        this.byte_length = byte_length_in;
        this.token_length = token_length_in;
        return :type_in;
    }

    [pub] fn getType : u32 (USE_UNICODE:bool, data: __ParserState$ref) { 

        [mut] t:u32 = this._type;

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

    [pub] fn isSym : bool (USE_UNICODE:bool, data:__ParserState$ref) {
        if((this._type) == 0 && this.getType(USE_UNICODE, data) == ${TokenTypes.SYMBOL}): {
            this._type = ${TokenTypes.SYMBOL};
        };

        return : (this._type )== ${TokenTypes.SYMBOL};
    }

    [pub] fn isNL : bool () {

        if((this._type) == 0 && ( this.current_byte) == 10 || (this.current_byte) == 13 ): {
            this._type = ${TokenTypes.NEW_LINE};
        };

        return : (this._type )== ${TokenTypes.NEW_LINE};
    }

    [pub] fn isSP : bool  (USE_UNICODE:bool, data:__ParserState$ref) {
        
        if((this._type) == 0 && (this.current_byte) == 32): {
            this._type = ${TokenTypes.SPACE}
        };

        return : (this._type )== ${TokenTypes.SPACE}
    }

    [pub] fn isNum : bool  (data:__ParserState$ref) {
        
        if (this._type) == 0 : {
            if this.getType(false, data) == ${TokenTypes.NUMBER} : {

                [const] l :u32 = data.input_len;

                [mut] off : u32 = this.byte_offset;

                loop ((off < l) && 47 < data.input[(off+=1)] && data.input[off] < 58)  {
                    this.byte_length += 1;  
                    this.token_length += 1;
                };

                this._type = ${TokenTypes.NUMBER};
                
                return : true

            } else 
                return : false
        } else 
            return : (this._type) == ${TokenTypes.NUMBER}
    }

    [pub] fn isUniID : bool  (data:__ParserState$ref) {
        
        if ((this._type) == 0 ) : {

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

                this._type = ${TokenTypes.IDENTIFIER};

                return:  true;
            }  else 
                return: false
        } else 
            return: (this._type) == ${TokenTypes.IDENTIFIER};
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
        this._type = source._type;
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
        this._type = source._type;
        return:*>this;
    }

    [pub] fn next:__Lexer$ref (data: __ParserState$ref){
            
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;
        
        if(data.input_len <= this.byte_offset) :{
            this._type = ${TokenTypes.END_OF_FILE};
            this.byte_length = 0;
            this.token_length = 0;
            this.current_byte = 0;
        }else{
            this.current_byte = data.input[this.byte_offset];
            if (this.current_byte) == 10:
                this.line += 1;
            this._type = 0;
            this.byte_length = 1;
            this.token_length = 1;
        };

        return :*> this;
    }
    
    [pub] fn END:bool (data:__ParserState$ref){
        return : this.byte_offset >= data.input_len
    }
}

fn token_production:bool(data:__ParserState$ref, production:StackFunction, pid:u32, _type:u32, tk_flag:u32){       
    
    [mut] l:__Lexer$ref = data.lexer;

    if (l._type) == _type : return : true;   
    
    if (data.active_token_productions & tk_flag) : return : false;     
    
    data.active_token_productions |= tk_flag;
        
    // preserve the current state of the data
    [const] stack_ptr :u32 = data.stack_ptr;
    [const] state:u32 = data.state;
    [mut new cpp_ignore] data_buffer : ParserStateBuffer = ParserStateBuffer();
    [mut js_ignore] data_buffer : ParserStateBuffer;

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
        l._type = _type;
        return: true;
    } else {
        data.stack_ptr = stack_ptr;
        l.sync(copy);
        return: false;
    };
    
    return: false;
}


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

fn create_state:u32 (ENABLE_STACK_OUTPUT:u32) {
    return : ${STATE_ALLOW_SKIP} | (ENABLE_STACK_OUTPUT << 1);
}

fn compare: u32(
    data: __ParserState$ref,
    data_offset: u32,
    sequence_offset:u32,
    byte_length: u32,
    sequence: __u8$ptr
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = sequence_offset;
    [const] len:u32 = j+byte_length;

    loop( (j<len) ){
        if(data.input[i] != sequence[j] ) : return : j - sequence_offset;
        j+=1;
        i+=1;
    };
        
    return : byte_length;
}

fn create_parser_data_object:__ParserState$ptr(
    input_buffer: __u8$ptr, input_len:u32, rules_len:u32
){
    [static new]parser_data:__ParserState$ptr = ParserState(input_buffer, input_len, rules_len);

    return : parser_data
}

[ptr] fn fork:__ParserState$ptr(
    data:__ParserState$ref,
    data_buffer:__ParserStateBuffer$ref
) {

    [mut] fork:__ParserState = __ParserState(
        data.input, 
        data.input_len,
        data.rules_len - data.rules_ptr
    );

    fork_ref:__ParserState$ref = *>fork;

    [mut] i:u32 = 0;
    
    loop ((i < data.stack_ptr + 1))  {
        fork_ref.stash[i] = data.stash[i];
        fork_ref.stack[i] = data.stack[i];
        i+=1;
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

fn set_action:void (val:u32, data:__ParserState$ref) {
    if(data.rules_ptr > data.rules_len) : return;
    data.rules[data.rules_ptr] = val;
    data.rules_ptr +=1;
}

fn add_reduce:void(data:__ParserState$ref, sym_len:u32, body:u32) {
    if isOutputEnabled(data.state) : {

        [mut] total:u32 = body + sym_len;

        if (total) == 0 : return;
    
        if( body > 0xFF || sym_len > 0x1F) : {
            
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

fn add_shift:void(data:__ParserState$ref, tok_len:u32) {

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

fn add_skip:void(data:__ParserState$ref, skip_delta:u32){

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

fn reset:void (data:__ParserState$ref, origin:__Lexer$ref, s_ptr:u32, r_ptr:u32) {
    data.rules_ptr = r_ptr;
    data.stack_ptr = s_ptr;
    (*>data.lexer).sync(origin);
}

fn consume: bool (data:__ParserState$ref) {
    data.l.prev_byte_offset = l.byte_offset + l.byte_length;
    if isOutputEnabled(data.state) : add_shift(data, l.token_length);
    data.l.next(data);
    return:true
}

fn pushFN:void(
    data:__ParserState$ref, 
    [pub] _fn_ref: StackFunction,
    stash: i32
){ 
    data.stack_ptr+=1;
    data.stack[data.stack_ptr] = _fn_ref; 
    data.stash[data.stack_ptr] = stash; 
    data.stash[data.stack_ptr + 1] = stash;
}

fn stepKernel:bool(
    data:__ParserState$ref, 
    lexer:__Lexer$ref, 
    data_buffer:__ParserStateBuffer$ref, 
    stack_base:i32
){
    [mut] ptr:i32 = data.stack_ptr;

    [static] _fn: StackFunction = data.stack[ptr];

    [static] stash:u32 = data.stash[ptr];

    data.stack_ptr-=1;

    [static] result:i32 = _fn(data, data_buffer, data.prod, stash);
    
    data.prod = result;

    if(result<0 || data.stack_ptr < stack_base) : {
        return:false;
    };

    return :true
}


fn run:i32(
    process_buffer : __ParserStateBuffer$ref,
    out_buffer : __ParserStateBuffer$ref,
    base:u32, 
    prod_id:u32
){

    loop ( ( process_buffer.len > 0 ) ) {
        
        [const]i:i32 =0;

        loop( (i < process_buffer.len)){

            [const] data:__ParserState$ref = *> process_buffer.data[i];
            
            if (!stepKernel(data, *>data.lexer, process_buffer, base)) : {

                data.COMPLETED = true;

                data.VALID = (data.prod) == prod_id;

                out_buffer.addDataPointerSorted(
                    process_buffer.removeDataAtIndex(i)
                );

                i-=1;
            };

            i +=1;
        };
    };

    return : resolved_len 
}

fn recognize: ParserStateBuffer(
    input_buffer: __u8$ptr,
    input_byte_length:u32, 
    production:u32,
    [pub] _fn_ref: StackFunction
){  
    [mut new cpp_ignore] process_buffer : ParserStateBuffer = ParserStateBuffer();
    [mut new cpp_ignore] out_buffer : ParserStateBuffer = ParserStateBuffer();
    [mut js_ignore] data_buffer : ParserStateBuffer;
    [mut] data_ref:__ParserState= __ParserState(
        input_buffer,
        input_len,
        rules_len
    );
    data_ref.stack[0] = _fn_ref; 
    data_ref.stash[0] = 0;
    data_ref.input_len = input_byte_length;
    data_ref.lexer.next(data_ref);

    data_buffer.addDataPointer(origin);

    root_data = &>data_ref;
    tip_data = &>data_ref;
    
    run(
        process_buffer,
        out_buffer,
        64, 
        0, 
        production
    );
    
    return: out_buffer;
}`);
    return val;
};