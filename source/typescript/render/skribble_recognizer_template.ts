/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { BaseOptions } from "vm";
import { Helper } from "../compiler/helper.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { parser, skRenderAsSK } from "../skribble/skribble.js";
import { SKModule } from "../skribble/types/node.js";
import { Grammar } from "../types/grammar.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { createSkipCallSk, getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { getProductionClosure } from "../utilities/production.js";
import { getSkippableSymbolsFromItems, getUnskippableSymbolsFromClosure } from "../utilities/symbol.js";
export const renderSkribbleRecognizer = (
    grammar: Grammar
): SKModule => {
    return <SKModule>parser(`
[static new] lookup_table : Uint8Array = Uint8Array(${jump8bit_table_byte_size});
[static new] sequence_lookup : Uint8Array = Uint8Array(${grammar.sequence_string.length});
[static] TokenSymbol: u32 = 1;
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

fn compare: u32(
    data: ParserData,
    data_offset: u32,
    sequence_offset:u32,
    byte_length:setUint32
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = sequence_offset;
    [const] len:u32 = j+byte_length;

    loop(;j<len; i++, j++)
        if(data.input[i] != sequence_lookup[j] ) : return : j - sequence_offset;

    return : byte_length;
}

fn cmpr_set : u32 (
    l : Lexer,
    data: ParserData,
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

fn getUTF8ByteLengthFromCodePoint : u32(code_point : u32){

    if (code_point) == 0:
        return: 1
    else if (code_point & 0x7F) == code_point : {
        return: 1;
    } else if (code_point & 0x7FF) == code_point : {
        return: 2;
    } else if (code_point & 0xFFFF) == code_point : {
        return: 3;
    } else {
        return: 4;
    }
}

fn  utf8ToCodePoint : u32 (l : Lexer,  data: ParserData){
    [const] buffer: Buffer8 = data.input;
    [mut] index : u32 = l.byte_offset + l.byte_length;
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


[pub wasm] cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] token_offset:u16 = 0
    [pub] prev_token_offset:u32 = 0
    [pub] type:u16 = 0
    [pub] type:u32 = 0
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

    [pub] fn isDiscrete: bool (data:ParserData, assert_class:u32, offset:u32 = 0, USE_UNICODE:bool = false) {

        [mut] type:u32 = 0;

        offset += this.byte_offset;

        if (offset >= data.input_len ): return: true;

        [mut] current_byte:u32 = data.input[offset];

        if (!USE_UNICODE || current_byte < 128) : {
            type = getTypeAt(current_byte);
        } else 
            type = getTypeAt(utf8ToCodePoint(offset, data));
        
        
        return : (type & assert_class) == 0;
    }

    [pub] fn setToken:void(type:u32, byte_length:u32, token_length:u32){
        this.type = type;
        this.byte_length = byte_length;
        this.token_length = token_length;
    }

    [pub] fn getType : u32 (USE_UNICODE:bool, data: ParserData) { 

        if this.END(data) : return : 0;

        if (this.type) == 0 :
            if ( !(USE_UNICODE) || this.current_byte < 128) :
                this.type = getTypeAt(this.current_byte)
            else {
                index:u32 = this.byte_offset;
                this.type = getTypeAt(utf8ToCodePoint(this, data));
            };

        return : this.type;
    }

    [pub] fn isSym : bool (USE_UNICODE:bool, data:ParserData) {
        return : (!this.END(data)) && this.getType(USE_UNICODE, data) == TokenSymbol;
    }

    [pub] fn isNL : bool () {
        return : (this.current_byte) == 10 || (this.current_byte) == 13
    }

    [pub] fn isSP : bool  (USE_UNICODE:bool, data:ParserData) {
        return : (this.current_byte) == 32 || USE_UNICODE && (TokenSpace) == this.getType(USE_UNICODE, data)
    }

    [pub] fn isNum : bool  (data:ParserData) {
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

    [pub] fn isUniID : bool  (data:ParserData) {
        
        if ((this.type) == 0 || (this.type) == TokenIdentifier) : {

            if (this.getType(true, data) == TokenIdentifier) : {

                [const] l :u32 = data.input_len;

                [mut]  off:u32  = this.byte_offset;

                prev_byte_len:u32  = this.byte_length;

                loop ( ((off + this.byte_length) < l) && ((UNICODE_ID_START | UNICODE_ID_CONTINUE) & lookup_table[utf8ToCodePoint(this, data)]) > 0) {
                    this.byte_length += 1;
                    prev_byte_len = this.byte_length;
                    this.token_length += 1;
                };
                this.byte_length = prev_byte_len;
                this.type = TokenIdentifierUnicode;
                return:  true;
            }  else 
                return: false
        } else 
            return: (this.type) == TokenIdentifierUnicode;
    }

    [pub] fn copy: void (){

        [const new] destination : Lexer = Lexer();
        
        destination.byte_offset = this.byte_offset;
        destination.byte_length = this.byte_length;
        
        destination.token_length = this.token_length;
        destination.token_offset = this.token_offset;
        destination.prev_token_offset = this.prev_token_offset;
        
        destination.type = this.type;
        destination.current_byte = this.current_byte;

        return :destination
    }

    [pub] fn sync:void (source: Lexer){
        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_token_offset = source.prev_token_offset;
        
        this.type = source.type;
        this.current_byte = source.current_byte;

        return:this
    }

    [pub] fn slice:Lexer(source:Lexer) {
        this.byte_length = this.byte_offset - source.byte_offset;
        this.token_length = this.token_offset - source.token_offset;
        this.byte_offset = source.byte_offset;
        this.token_offset = source.token_offset;
        return:this;
    }

    [pub] fn next:void (data: ParserData){
            
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;
        
        if(data.input_len < this.byte_offset) :{
            this.type = 0;
            this.byte_length = 0;
            this.token_length = 0;
        }else{
            this.current_byte = data.input[this.byte_offset];
            this.type = 0;
            this.byte_length = 1;
            this.token_length = 1;
            if (this.current_byte) == 10:
                this.line += 1;
        };

        return :this
    }
    

    [pub] fn END:bool (data:ParserData){
        return : this.byte_offset >= data.input_len
    }
}



[pub wasm]  cls ParserData{
    [pub] lexer: Lexer = Lexer()
    [pub] state: u32 = 0 
    [pub] prop: u32 = 0 
    [pub] stack_ptr: u32 = 0
    [pub] input_ptr: u32 = 0
    [pub] rules_ptr: u32 = 0
    [pub] error_ptr: u32 = 0
    [pub] debug_ptr: u32 = 0
    [pub] input_len: u32 = 0
    [pub] rules_len: u32 = 0
    [pub] error_len: u32 = 0
    [pub] origin_fork: u32 = 0
    [pub] input: Uint8Array  = Array()
    [pub] rules: Uint16Array = Array()
    [pub] error: Uint8Array = Array()
    [pub] stash: Uint32Array = Array()
    [pub] stack: Array = Array()
    [pub] origin: ParserData = ParserData()
    [pub] alternate: ParserData = ParserData()

    [pub]  fn ParserData:ParserData(
        input_len:u32, rules_len:u32, error_len:u32
    ){
        this.state = createState(1);
        this.prop = 0;
        this.stack_ptr = 0;
        this.input_ptr = 0;
        this.rules_ptr = 0;
        this.error_ptr = 0;
        this.input_len = input_len;
        this.rules_len = rules_len;
        this.error_len = error_len;
        this.debug_len = 0;
        this.origin_fork = 0;
        [ptr this_] origin:u32 = 0;
        [ptr this_] alternate:u32 = 0;
        [new this_] lexer:Lexer = Lexer();
        [new this_] input:Uint8Array = Uint8Array(input_len);
        [new this_] rules:Uint16Array = Uint16Array(rules_len);
        [new this_] error:Uint8Array = Uint8Array(error_len);
        [new this_] stash:Uint32Array = Uint32Array(256);
        [new this_] stack:Array = Array();
    }
}


[pub wasm] cls ForkData{

    [pub] ptr: u32 = 0
    [pub] valid:bool = 0
    [pub] depth:u32 = 0
    [pub] command_offset:u32 = 0
    [pub] command_block: Uint16Array = 0

    [pub] fn ForkData:ForkData(
        ptr:u32,
        valid:bool,
        depth:u32
    ){
        this.ptr = ptr;
        this.valid = valid;
        this.depth = depth;
        this.command_offset = 0;
        [this_ new] command_block:Uint16Array = Uint16Array(64);
    }
}

fn fork:ParserData(data:ParserData) {

    [mut new] fork:ParserData = ParserData(
        data.input_len,
        data.rules_len,
        data.error_len - data.error_ptr
    );

    [mut] i:u32 = 0;
    
    loop (; i < data.stack_ptr; i++)  {
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

    loop ((data.alternate)) {
        data = data.alternate;
    };

    data.alternate = fork;

    return :fork; 
}



fn init_data:ParserData(
    input_len:u32, rules_len:u32, error_len:u32
){
    [static new]parser_data:ParserData = ParserData(input_len, rules_len, error_len);

    return : parser_data
}

[pub] fn assert_ascii:bool(l:Lexer, a:u32, b:u32, c:u32, d:u32) {
    
    [const] ascii : u32 = l.current_byte;

    if ascii < 32: return: ((a & (1 << ascii)) != 0)

    else if ascii < 64: return: ((b & (1 << (ascii - 32))) != 0)

    else if ascii < 96: return: ((c & (1 << (ascii - 64))) != 0)

    else if ascii < 128: return: ((d & (1 << (ascii - 96))) != 0);

    return:false
}

fn add_reduce:void(state:u32, data:ParserData, sym_len:u32, body:u32, DNP:bool = false) {
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

fn add_shift:void(l:Lexer, data:ParserData, tok_len:u32) {

    if tok_len < 1 : return;
    
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

fn add_skip:void(l:Lexer, data:ParserData, skip_delta:u32){

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

fn set_error:void (val:u32, data:ParserData) {
    if(data.error_ptr > data.error_len) : return;
    data.error[data.error_ptr++] = val;
}

fn set_action:void (val:u32, data:ParserData) {
    if(data.rules_ptr > data.rules_len) : return;
    data.rules[data.rules_ptr++] = val;
}

fn createState:u32 (ENABLE_STACK_OUTPUT:u32) {
    return : STATE_ALLOW_SKIP | (ENABLE_STACK_OUTPUT << 1);
}

fn hasStateFailed:bool(state:u32) {
    [const] IS_STATE_VALID:u32 = 1;
    return : 0 == (state & IS_STATE_VALID); //==
}

[pub] fn mark:u32 (val:u32, data:ParserData) { return:action_ptr }

fn isOutputEnabled:bool (state:u32) { return: NULL_STATE != (state & STATE_ALLOW_OUTPUT) }

fn reset:u32 (mark:u32, origin:Lexer, advanced:Lexer, state:u32) {
    action_ptr = mark;
    advanced.sync(origin);
    return:state
}

fn consume: bool (l:Lexer, data:ParserData, state:u32) {
    if isOutputEnabled(state) : add_shift(l, data, l.token_length);
    l.next(data);
    return:true
}

fn assertSuccess: bool (l:Lexer, data:ParserData, condition:bool) {
    if ( /*!*/condition || hasStateFailed(state)) : return:fail(l, state)
    else return:state
}

fn debug_add_header: void(
    data:ParserData, 
    number_of_items:u32, 
    delta_char_offset:u32, 
    peek_start:u32, 
    peek_end:u32, 
    fork_start:u32, 
    fork_end:u32
) {
        
    if(data.debug_ptr + 1 >= data.debug_len) : return;

    [const] local_pointer:u32 = data.debug_ptr;
    
    if (delta_char_offset > 62):{

        data.debug[local_pointer+1] = delta_char_offset;

        delta_char_offset = 63;

        data.debug_ptr++;
    };

    data.debug[local_pointer] = ((number_of_items && /*0x3F*/2) 
        | ( delta_char_offset << 6) 
        | ((peek_start & 1) << 12) 
        | ((peek_end & 1) << 13)
        | ((fork_start & 1) << 14) 
        | ((fork_end & 1) << 15));

    data.debug_ptr++;
}


fn pushFN:void(data:ParserData, [re_function Lexer ParserData u32 u32 u32]_fn_ref:u32){ data.stack[++data.stack_ptr] = _fn_ref; }

fn init_table:int_array(){ return: lookup_table;  }

[pub static new] data_stack : Array = Array();

fn run:void(data:ParserData){
    data_stack.length = 0;
    data_stack.push(data);

    [mut] ACTIVE:bool = true;

    loop ((ACTIVE)) {
        loop([mut] data:ParserData in data_stack){
            ACTIVE = stepKernel(data, 0)
        }
    }
}


fn stepKernel:bool(data:ParserData, stack_base:u32){
    [mut] ptr:u32 = data.stack_ptr;

    [static function Lexer ParserData u32 u32 u32] _fn:u32 = data.stack[ptr];
    [static] stash:u32 = data.stash[ptr];

    data.stack_ptr--;

    [static] result:u32 = _fn(data.lexer, data, data.state, data.prod, stash);

    data.stash[ptr] = result;
    data.prod = result;

    if(result<0 || data.stack_ptr < stack_base) :
        return:false;

    return :true
}

fn get_fork_information:void(){
    [mut] i:u32 = 0;

    [static array] fork_data:array = Array();

    loop([mut]data:ParserData in data_stack) {
        [mut new] fork:ForkData = ForkData(
            (i++),
            (data.valid || true),
            (data.origin_fork + data.rules_ptr)
        );
        fork_data.push(fork)
    };

    return: fork_data;
}

fn block64Consume:i32([ParserData] data:ParserData, block:Uint16Array, offset:u32, block_offset:u32, limit:u32) {
    //Find offset block

    [mut] containing_data:ParserData = data;
    [mut] end:i32 = containing_data.origin_fork + data.rules_ptr;

    //Find closest root
    loop ((containing_data.origin_fork > offset) ){
        end = containing_data.origin_fork;
        containing_data = containing_data.origin;
    };

    [mut] start:i32 = containing_data.origin_fork;

    offset -= start;
    end -= start;

    //Fill block with new data
    [mut] ptr:u32 = offset;

    if (ptr >= end) : return : limit - block_offset;

    loop ((block_offset < limit) ){
        block[block_offset++] = containing_data.rules[ptr++];
        if (ptr >= end) :
            return: block64Consume(data, block, ptr + start, block_offset, limit);
    };

    return: 0;
}

fn get_next_command_block:Uint16Array(fork:ForkData) {

    [static] remainder:u32 = block64Consume(data_stack[fork.ptr], fork.command_block, fork.command_offset, 0, 64);

    fork.command_offset += 64 - remainder;

    if (remainder > 0) :
        fork.command_block[64 - remainder] = 0;

    return : fork.command_block;
}

fn recognizer:bool(data:ParserData, input_byte_length:u32, production:u32){
    data.input_len = input_byte_length;
    data.lexer.next(data);
    dispatch(data, production);
    run(data);
}
`);
};

export function createDispatchTemplate(
    grammar: Grammar,
    runner: Helper,
    rd_functions: RDProductionFunction[],
) {
    return <SKModule>parser(`
    fn dispatch:u32(data:ParserData, production_index:u32){
        match production_index :
            ${rd_functions.filter(f => f.RENDER)
            .map((fn, i) => {
                const name = getProductionFunctionNameSk(grammar[fn.id], grammar);
                const closure = getProductionClosure(0, grammar);
                const skippable = getSkippableSymbolsFromItems(closure, grammar);
                const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
                const skip_call = skRenderAsSK(createSkipCallSk(skippable, <BaseOptions>{ grammar, helper: runner }, "data.lexer", false, unskippable, true));
                return `${i} : { ${skip_call}; data.stack[0] = ${name}; data.stash[0] = ${0}; return }`;
            }).join(",")}
        
    }`);
}

export function createParserTemplate(
    grammar,
    runner,
) {

}
