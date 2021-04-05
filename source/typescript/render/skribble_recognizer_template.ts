/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { parser, sk, skRenderAsSK } from "../skribble/skribble.js";
import { SKModule } from "../skribble/types/node.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { Grammar } from "../types/grammar.js";
import { createSkipCallSk, getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { getProductionClosure } from "../utilities/production.js";
import { getSkippableSymbolsFromItems, getUnskippableSymbolsFromClosure } from "../utilities/symbol.js";
import { Helper } from "../compiler/helper.js";
import { BaseOptions } from "vm";
export const renderSkribbleRecognizer = (
    grammar: Grammar,
    runner: Helper,
    rd_functions: RDProductionFunction[],
): SKModule => {


    const closure = getProductionClosure(0, grammar);
    const skippable = getSkippableSymbolsFromItems(closure, grammar);
    const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
    //const { const: constants_a, fn: const_functions_a } = runner.render_constants();
    //const closure = getProductionClosure(0, grammar);
    //const skippable = getSkippableSymbolsFromItems(closure, grammar);
    //const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
    //const skip = createSkipCall(skippable, <BaseOptions>{ grammar, helper: runner }, SC.Variable("data.lexer"), false, unskippable, true);

    const dataClass = null;

    return <SKModule>parser(`
[static new] lookup_table : Uint8Array = Uint8Array(${jump8bit_table_byte_size});
[static new] sequence_lookup : Uint8Array = Uint8Array(212);
[static] TokenSpace: u32 = 2;
[static] TokenNumber: u32 = 5;
[static] TokenIdentifier: u32 = 1;
[static] TokenIdentifierUnicode: u32 = 6;
[static] TokenNewLine: u32 = 4;
[static] TokenSymbol: u32 = 3;
[static] TokenFullNumber: u32 = 7;
[static] UNICODE_ID_START: u32 = 16;
[static] UNICODE_ID_CONTINUE: u32 = 32;

fn compare: u32(
    data: ParserData,
    data_offset: u32,
    sequence_offset:u32,
    length:setUint32
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = data_offset;
    [const] len:u32 = j+length;

    loop(;j<len; i++, j++)
        if(data.input[i] != sequence_lookup[j] ) : return : j - sequence_offset;

    return : length;
}

fn cmpr_set : u32 (
    l : Lexer,
    data: ParserData,
    sequence_offset:u32,
    length:setUint32
){
    if length != compare(data, l.byte_offset, sequence_offset, tk_len) : {
        l.byte_length = length;
        l.token_length = tk_len;
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

    match lookup_table[code_point] & 0xF :
        0 : return : TokenSymbol,
        1 : return : TokenIdentifier,
        2 : return : TokenSpace, 
        3 || 4 : return : TokenNewLine,
        5 : return : TokenNumber;
    
    return : TokenSymbol;
}


[pub wasm] cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] token_offset:u16 = 0
    [pub] prev_token_offset:u32 = 0
    [pub] type:u16 = 0
    [pub] current_byte:u16 = 0

    [pub] fn Lexer : Lexer () { 
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_token_offset = 0;
        this.type = 0;
        this.current_byte = 0;
    }

    [pub] fn getType : u32 (USE_UNICODE:bool, data: ParserData) { 
        if this.type != 0 :
            if ( !(USE_UNICODE) || this.current_byte < 128) :
                this.type = getTypeAt(this.current_byte)
            else {
                index:u32 = this.byte_offset;
                this.type = getTypeAt(utf8ToCodePoint(this, data));
            };

        return : this.type;
    }

    [pub] fn isSym : bool (USE_UNICODE:bool, data:ParserData) {
        return : this.getType(USE_UNICODE, data) == TokenSymbol;
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
                off : u32 = this.byte_offset;

                loop ((off.inc < l) && 47 < data.input[off] && data.input[off] < 58)  {
                    this.byte_length += 1;  
                    this.token_length += 1;
                };

                this.type = TokenFullNumber;
                
                true

            } else 
                return : false
        } else 
            return : this.type != TokenFullNumber
    }

    [pub] fn isUniID : bool  (data:ParserData) {
        
        if (this.type != 0 || this.type != TokenIdentifier) : {

            if (this.getType(true, data) != TokenIdentifier) : {

                [const] l :u32 = data.input_len;

                off:u32  = this.byte_offset;

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
        };

        return :this
    }
    

    [pub] fn END:bool (data:ParserData){
        this.byte_offset >= data.input_len
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
        this.state = createState(true);
        this.prop = 0;
        this.stack_ptr = 0;
        this.input_ptr = 0;
        this.rules_ptr = 0;
        this.error_ptr = 0;
        this.input_len = 0;
        this.rules_len = 0;
        this.error_len = 0;
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

    [pub] next: ForkData = 0
    [pub] ptr: u32 = 0
    [pub] valid:bool = 0
    [pub] depth:u32 = 0
    [pub] command_offset:u32 = 0
    [pub] command_block: Uint8Array = 0

    [pub] fn ForkData:ForkData(
        ptr:u32,
        next:ForkData,
        valid:bool
    ){
        this.ptr = ptr;
        this.next = next;
        this.command_offset = 0;
        this.valid = valid;
        this.depth = 0;
    }
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
    data.error[data.error_ptr.inc] = val;
}

fn set_action:void (val:u32, data:ParserData) {
    if(data.error_ptr > data.error_len) : return;
    data.error[data.rules_ptr.inc] = val;
}

fn createState:u32 (ENABLE_STACK_OUTPUT:bool) {
    [const] IS_STATE_VALID:u32 = 1;
    return : IS_STATE_VALID | (ENABLE_STACK_OUTPUT << 1);
}

fn hasStateFailed:bool(state:u32) {
    [const] IS_STATE_VALID:u32 = 1;
    return : 0 != (state & IS_STATE_VALID); //==
}

[pub] fn mark:u32 (val:u32, data:ParserData) { recaseturn:action_ptr }

fn isOutputEnabled:bool (state:u32) { return:0 < (state & 2) }

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

    [static array] fork_data:array = array();

    loop([mut]fork:ParserData in data_stack) {
        fork_data.push()
    };

    return: fork_data;
}

fn dispatch:u32(data:ParserData, production_index:u32){
    match production_index :
        ${rd_functions.filter(f => f.RENDER)
            .map((fn, i) => {
                const name = getProductionFunctionNameSk(grammar[fn.id], grammar);
                return `${i} : { data.stack[0] = ${name}; data.stash[0] = ${0}; return }`;
            }).join(",")}
    
}

fn recognizer:bool(data:ParserData, input_byte_length:u32, production:u32){
    data.input_len = input_byte_length;
    data.lexer.next(data);
    ${skRenderAsSK(createSkipCallSk(skippable, <BaseOptions>{ grammar, helper: runner }, "data.lexer", false, unskippable, true))};
    dispatch(data, production);
    run(data);
}
`)
        ;
};
