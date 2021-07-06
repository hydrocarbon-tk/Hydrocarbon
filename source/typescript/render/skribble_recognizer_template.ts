/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Helper } from "../build/helper.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { parser, skRenderAsSK } from "../skribble/skribble.js";
import { SKModule } from "../skribble/types/node.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { createSkipCallSk, getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { getProductionClosure } from "../utilities/production.js";
import { getSkippableSymbolsFromItems, getUnskippableSymbolsFromClosure } from "../grammar/nodes/symbol.js";
export const renderSkribbleRecognizer = (
    grammar: HCG3Grammar
): SKModule => {
    const val = <SKModule>parser(`
[static new] lookup_table : __u8$ptr;
[static new] sequence_lookup : array_u8 = a(${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")});
[static] TokenSymbol: u32 = 1;
[static] action_ptr: u32 = 0;
[static] TokenIdentifier: u32 = 2;
[static] TokenSpace: u32 = 4;
[static] TokenNewLine: u32 = 8;
[static] TokenNumber: u32 = 16;
[static] TokenIdentifierUnicode: u32 = 32 | TokenIdentifier;
[static] TokenFullNumber: u32 = 128 | TokenNumber;
[static] UNICODE_ID_CONTINUE: u32 = 32;
[static] UNICODE_ID_START: u32 = 64;
[static] NULL_STATE: u32 = 0;
[static] STATE_ALLOW_SKIP: u32 = 1;
[static] STATE_ALLOW_OUTPUT: u32 = 2;

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

    return : (lookup_table[code_point] & 0x1F);
}

fn createState:u32 (ENABLE_STACK_OUTPUT:u32) {
    return : STATE_ALLOW_SKIP | (ENABLE_STACK_OUTPUT << 1);
}

[pub wasm]  cls ParserData{
    [pub ptr] lexer: __Lexer$ptr
    [pub] state: u32
    [pub] prod: u32 = 0 
    [pub] stack_ptr: i32 = 0
    [pub] input_ptr: u32 = 0
    [pub] rules_ptr: u32 = 0
    [pub] input_len: u32 = 0
    [pub] rules_len: u32 = 0
    [pub] origin_fork: u32 = 0
    [pub ptr] input: array_u8
    [pub ptr] rules: array_u16
    [pub] stack: function_pointer = 
        fn : i32 (l:__Lexer$ref,data:__ParserData$ref, state:u32, prod:u32, prod_start:u32){64}
    [pub] stash: array_u32 = call(64)
    [pub] origin: __ParserData$ptr
    [pub] next: __ParserData$ptr = 0
    [pub] VALID: bool = 0 
    [pub] COMPLETED: bool = 0 

    [pub]  fn ParserData:ParserData(
        input_len_in:u32, rules_len_in:u32,  lexer_in: __Lexer$ptr
    ){
        this.lexer = lexer_in;
        this.state = createState(1);
        this.prod = 0;
        this.VALID = false;
        this.COMPLETED = false;
        this.stack_ptr = 0;
        this.input_ptr = 0;
        this.rules_ptr = 0;
        this.input_len = input_len_in;
        this.rules_len = rules_len_in;
        this.origin_fork = 0;
        [this_] origin:u32 = 0;
        
        if input_len_in > 0: {
            [new this_] input:array_u8 = array_u8(input_len_in);
        };

        [new this_] rules:array_u16 = array_u16(rules_len_in);
        [new this_ cpp_ignore] stash:array_u32 = array_u32(256);
        [new this_ cpp_ignore] stack:array_any = array_any();
    }

    [pub] fn ParserData:destructor(){
        
        %%%% (input);
            
        %%%% (rules);
        
        **** ( lexer);
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

[pub] root_data: __ParserData$ptr = 0;
[pub] tip_data: __ParserData$ptr = 0;

[pub static new] out_array : array___ParserData$ptr = Array(64);
[pub static new] data_array : array___ParserData$ptr = Array(64);
[pub static new] fork_array : array___DataRef$ptr = Array(64);

[pub] out_array_len :u32 = 0;
[pub] data_array_len :u32 = 0;
[pub] fork_array_len :u32 = 0;

[pub wasm] cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] token_offset:u32= 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] prev_token_offset:u32 = 0
    [pub] type:u32 = 0
    [pub] line:u16 = 0
    [pub] current_byte:u16 = 0

    [pub] fn Lexer : Lexer () { 
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_token_offset = 0;
        this.type = 0;
        this.line = 0;
        this.current_byte = 0;
    }

    [pub] fn isDiscrete: bool (data:__ParserData$ref, assert_class:u32, offset:u32 = 0, USE_UNICODE:bool = false) {

        [mut] type:u32 = 0;

        offset += this.byte_offset;

        if (offset >= data.input_len ): return: true;

        [mut] current_byte:u32 = data.input[offset];

        if (!USE_UNICODE || current_byte < 128) : {
            type = getTypeAt(current_byte);
        } else 
            type = getTypeAt(utf8ToCodePoint(offset,  data.input));
        
        
        return : (type & assert_class) == 0;
    }

    [pub] fn setToken:void(type_in:u32, byte_length_in:u32, token_length_in:u32){
        this.type = type_in;
        this.byte_length = byte_length_in;
        this.token_length = token_length_in;
    }

    [pub] fn getType : u32 (USE_UNICODE:bool, data: __ParserData$ref) { 

        if this.END(data) : return : 0;

        if (this.type) == 0 :{
            if ( !(USE_UNICODE) || this.current_byte < 128) :{
                this.type = getTypeAt(this.current_byte)
           } else {
                [const] code_point:u32 = utf8ToCodePoint(this.byte_offset, data.input);
                this.byte_length = getUTF8ByteLengthFromCodePoint(code_point);
                this.type = getTypeAt(code_point);
            }
        };

        return : this.type;
    }

    [pub] fn isSym : bool (USE_UNICODE:bool, data:__ParserData$ref) {
        return : (!this.END(data)) && this.getType(USE_UNICODE, data) == TokenSymbol;
    }

    [pub] fn isNL : bool () {
        return : (this.current_byte) == 10 || (this.current_byte) == 13
    }

    [pub] fn isSP : bool  (USE_UNICODE:bool, data:__ParserData$ref) {
        return : (this.current_byte) == 32 || USE_UNICODE && (TokenSpace) == this.getType(USE_UNICODE, data)
    }

    [pub] fn isNum : bool  (data:__ParserData$ref) {
        if (this.type) == 0 || (this.type) == TokenNumber : {
            if this.getType(false, data) == TokenNumber : {

                [const] l :u32 = data.input_len;

                [mut] off : u32 = this.byte_offset;

                loop ((off++ < l) && 47 < data.input[off] && data.input[off] < 58)  {
                    this.byte_length += 1;  
                    this.token_length += 1;
                };

                this.type = TokenFullNumber;
                
                return : true

            } else 
                return : false
        } else 
            return : (this.type) == TokenFullNumber
    }

    [pub] fn isUniID : bool  (data:__ParserData$ref) {
        
        if ((this.type) == 0 || (this.type) == TokenIdentifier) : {

            if (this.getType(true, data) == TokenIdentifier) : {

                [const] l :u32 = data.input_len;

                [mut]  off:u32  = this.byte_offset;

                prev_byte_len:u32  = this.byte_length;

                loop ( (off + this.byte_length) < l)  {
                    [const] code_point: u32 = utf8ToCodePoint(this.byte_offset + this.byte_length, data.input);

                    if( ((UNICODE_ID_START | UNICODE_ID_CONTINUE) & lookup_table[code_point]) > 0) : {
                        this.byte_length += getUTF8ByteLengthFromCodePoint(code_point);
                        prev_byte_len = this.byte_length;
                        this.token_length += 1;
                    } else {
                        break;
                    }
                };

                this.byte_length = prev_byte_len;

                this.type = TokenIdentifierUnicode;

                return:  true;
            }  else 
                return: false
        } else 
            return: (this.type) == TokenIdentifierUnicode;
    }

    [pub] fn copy: __Lexer$ptr (){

        [const new] destination : __Lexer$ptr = Lexer();

        [const] destination_ref : __Lexer$ref = *> destination;
        
        destination_ref.byte_offset = this.byte_offset;
        destination_ref.byte_length = this.byte_length;
        
        destination_ref.token_length = this.token_length;
        destination_ref.token_offset = this.token_offset;
        destination_ref.prev_token_offset = this.prev_token_offset;
        
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
        destination.prev_token_offset = this.prev_token_offset;
        
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
        this.prev_token_offset = source.prev_token_offset;
        
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
        
        if(data.input_len < this.byte_offset) :{
            this.type = 0;
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


fn compare: u32(
    data: __ParserData$ref,
    data_offset: u32,
    sequence_offset:u32,
    byte_length: u32
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = sequence_offset;
    [const] len:u32 = j+byte_length;

    loop(;j<len; i++, j++)
        if(data.input[i] != sequence_lookup[j] ) : return : j - sequence_offset;

    return : byte_length;
}


fn cmpr_set : u32 (
    l : __Lexer$ref,
    data: __ParserData$ref,
    sequence_offset:u32,
    byte_length:u32,
    token_length:u32
){
    if (byte_length) == compare(data, l.byte_offset, sequence_offset, byte_length) : {
        l.byte_length = byte_length;
        l.token_length = token_length;
        return : true;
    };

    return : false;
}

fn create_parser_data_object:__ParserData$ptr(
    input_len:u32, rules_len:u32
){
    [mut new] lexer: __Lexer$ptr = Lexer();

    [static new]parser_data:__ParserData$ptr = ParserData(input_len, rules_len,  lexer);

    return : parser_data
}

[ptr] fn fork:__ParserData$ptr(data:__ParserData$ref) {

    [mut] fork:__ParserData$ptr = create_parser_data_object(
        0,
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
    fork_ref.input_ptr = data.input_ptr;
    fork_ref.input_len = data.input_len;
    fork_ref.origin_fork = data.rules_ptr + data.origin_fork;
    fork_ref.origin = &>data;
    fork_ref.lexer = (*>data.lexer).copy();
    fork_ref.state = data.state;
    fork_ref.prod = data.prod;
    fork_ref.input = data.input;

    data_array[data_array_len] = fork;

    data_array_len++;

    return :fork; 
}


[pub] fn assert_ascii:bool(l:__Lexer$ref, a:u32, b:u32, c:u32, d:u32) {
    
    [const] ascii : u32 = l.current_byte;

    if ascii < 32: return: ((a & (1 << ascii)) != 0)

    else if ascii < 64: return: ((b & (1 << (ascii - 32))) != 0)

    else if ascii < 96: return: ((c & (1 << (ascii - 64))) != 0)

    else if ascii < 128: return: ((d & (1 << (ascii - 96))) != 0);

    return:false
}

fn isOutputEnabled:bool (state:u32) { return: NULL_STATE != (state & STATE_ALLOW_OUTPUT) }

fn set_action:void (val:u32, data:__ParserData$ref) {
    if(data.rules_ptr > data.rules_len) : return;
    data.rules[data.rules_ptr++] = val;
}

fn add_reduce:void(state:u32, data:__ParserData$ref, sym_len:u32, body:u32 = 0, DNP:bool = false) {
    if isOutputEnabled(state) : {

        [mut] total:u32 = body + sym_len;

        if (total) == 0 : return;
    
        if body > 0xFF || sym_len > 0x1F : {
            
            [const] low:u32 = (1 << 2) | (body & 0xFFF8);
            
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

fn convert_prod_to_token:void(data:__ParserData$ref, prod_start:u32) {

    [const] prod_end:u32 = data.rules_ptr;
    [mut] token_len:u32 = 0;
    [mut] i:u32 = prod_start;

    loop (; i < prod_end; i++) {
        
        [mut] rule:u16 = data.rules[i];

        if (rule & 4) == 1 : i++;

        if (rule & 3) > 0 : {

            [mut] length:u32 = (rule >> 3) & 0x1FFF;

            if (rule & 4) == 1 : 
                length = ((length << 16) | data.rules[i]);

            token_len += length;
        }
    };

    data.rules_ptr = prod_start;

    add_shift(data, token_len);
}


[pub] fn mark:u32 (val:u32, data:__ParserData$ref) { return:action_ptr }


fn reset:u32 (mark:u32, origin:__Lexer$ref, advanced:__Lexer$ref, state:u32) {
    action_ptr = mark;
    advanced.sync(origin);
    return:state
}

fn consume: bool (l:__Lexer$ref, data:__ParserData$ref, state:u32) {
    if isOutputEnabled(state) : add_shift(data, l.token_length);
    l.next(data);
    return:true
}

fn pushFN:void(
    data:__ParserData$ref, 
    [pub] _fn_ref: function_pointer = 
        fn : i32 (l:__Lexer$ref,data:__ParserData$ref, state:u32, prod:u32, prod_start:u32){}
){ 
    data.stack[++data.stack_ptr] = _fn_ref; 
}

fn stepKernel:bool(data:__ParserData$ref, lexer:__Lexer$ref, stack_base:i32){
    [mut] ptr:i32 = data.stack_ptr;

    [static js_ignore] _fn:function_pointer = 
    fn : i32 (l:__Lexer$ref,data:__ParserData$ref, state:u32, prod:u32, prod_start:u32){data.stack[ptr]};

    [static cpp_ignore] _fn: any = data.stack[ptr];

    [static] stash:u32 = data.stash[ptr];

    data.stack_ptr--;

    [static] result:u32 = _fn(lexer, data, data.state, data.prod, stash);

    data.stash[ptr] = result;
    data.stash[ptr + 1] = result;
    data.prod = result;

    if(result<0 || data.stack_ptr < stack_base) : {
        data.VALID = (*>data.lexer).END(data) && (result >= 0);
        return:false;
    };

    return :true
}

fn addDataToOutArray:void(data:__ParserData$ptr, index:u32){
    
    [const]i:u32 = out_array_len;

    if i > 63: i = 63;

    out_array_len = i + 1;
    
    loop(; i > index; i--){
        out_array[i] = out_array[i-1];
    };

    out_array[index] = data;
}

fn removeEntryFromDataArray:void(index:u32){
    
    data_array_len--;

    [mut] j:u32 = index;

    loop (; j < data_array_len; j++){
        data_array[j] = data_array[j+1];
    };
}

fn insertData:void(data:__ParserData$ptr){
    
    [const] in_ref:__ParserData$ref =  *>data;
    
    [const]i:u32 =0;

    loop( ; i < out_array_len; i++){
        [const] exist_ref:__ParserData$ref = *>out_array[i];

        if in_ref.VALID : {
            if (!exist_ref.VALID) : {
                break;
            }
        } else {
           if (!exist_ref.VALID && (exist_ref.input_ptr < in_ref.input_ptr)) :{
                break;
           }
        }
    };

    if (i < 64):
        addDataToOutArray(data, i);
}

fn run:void(){

    loop ( (data_array_len > 0 ) ) {
        
        [const]i:u32 =0;

        loop( ; i < data_array_len; i++){

            [const] data:__ParserData$ref = *> data_array[i];
            
            if (!stepKernel(data, *>data.lexer, 0)) : {

                data.COMPLETED = true;

                removeEntryFromDataArray(i--);

                insertData(&>data);
            };
        };
    }
}

`);
    return val;
};

export function createExternFunctions(
    grammar: HCG3Grammar,
    runner: Helper,
    rd_functions: RDProductionFunction[],
) {
    return <SKModule>parser(`
    fn dispatch:void(data:__ParserData$ref, production_index:u32){
        match production_index :
            ${rd_functions.filter(f => f.RENDER && grammar.productions[f.id].ROOT_PRODUCTION)
            .map((fn, i) => {
                const name = getProductionFunctionNameSk(grammar.productions[fn.id], grammar);
                const closure = getProductionClosure(0, grammar);
                const skippable = getSkippableSymbolsFromItems(closure, grammar);
                const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
                const skip_fn = createSkipCallSk(skippable, <BaseOptions>{ grammar, helper: runner }, "(*>data.lexer)", false, unskippable, true);

                if (skip_fn) {
                    const skip_call = skRenderAsSK(skip_fn);
                    return `${i} : { ${skip_call}; data.stack[0] = &> ${name}; data.stash[0] = ${0}; return }`;
                }

                return `${i} : { data.stack[0] = &> ${name}; data.stash[0] = ${0}; return }`;

            }).join(",")}
    }


fn clear_data:void () {

    **** root_data;
    
    [mut]i:u32 =0;

    loop( ; i < fork_array_len; i++){
        **** fork_array[i];
    };

    fork_array_len = 0;
    out_array_len = 0;
    data_array_len = 0;
}

[extern]fn init_data:__u8$ptr(
    input_len:u32 , 
    rules_len:u32 
){ 
    clear_data();

    data_array_len = 1;

    [mut] data:__ParserData$ptr = create_parser_data_object(
        input_len,
        rules_len
    );

    data_array[0] = data;

    return: (*>data).input;
}


[extern] fn init_table:__u8$ptr(){ 
    [new] table: array_u8 = array_u8(${jump8bit_table_byte_size});

    lookup_table = table;

    return: lookup_table;  
}

[extern]fn get_fork_pointers:__DataRef$ptr$ptr(){

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



fn block64Consume:i32(data:__ParserData$ref, block:array_u16, offset:u32, block_offset:u32, limit:u32) {
    //Find offset block

    [mut] containing_data:__ParserData$ptr = data;
    [mut] end:i32 = containing_data.origin_fork + data.rules_ptr;

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

[extern] fn get_next_command_block:__u16$ptr(fork:__DataRef$ptr) {

    [const] fork_ref:__DataRef$ref = *>fork;

    [static] remainder:u32 = block64Consume(
        *>fork_ref.ptr, 
        fork_ref.command_block, 
        fork_ref.command_offset, 
        0, 64);

    fork_ref.command_offset += 64 - remainder;

    if (remainder > 0) :
        fork_ref.command_block[64 - remainder] = 0;

    return : fork_ref.command_block;
}

[extern] fn recognize:u32(input_byte_length:u32, production:u32){
    
    [pub] data_ref:__ParserData$ref = *> data_array[0];
    
    data_ref.input_len = input_byte_length;
    
    (*>data_ref.lexer).next(data_ref);
    
    dispatch(data_ref, production);

    root_data = &>data_ref;
    tip_data = &>data_ref;
    
    run();
    
    return: out_array_len;
}`);
}

export function createParserTemplate(
    grammar,
    runner,
) {

}
