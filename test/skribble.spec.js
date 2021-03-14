import { parser_factory } from "../build/library/parsers/parser.js";


const
    parser = parser_factory.parser,
    data = `
[static] lookup_table : Buffer8 = Buffer8(1256)
[static] sequence_lookup : Buffer8 = Buffer8(212,212)
[static] TokenSpace: u32 = 2
[static] TokenNumber: u32 = 5
[static] TokenIdentifier: u32 = 1
[static] TokenIdentifierUnicode: u32 = 6
[static] TokenNewLine: u32 = 4
[static] TokenSymbol: u32 = 3
[static] TokenFullNumber: u32 = 7
[static] UNICODE_ID_START: u32 = 16
[static] UNICODE_ID_CONTINUE: u32 = 32

fn compare: u32(
    data: ParserData,
    data_offset: u32,
    sequence_offset:u32,
    length:setUint32
){
    [mut] i:u32 = data_offset;
    [mut] j:u32 = data_offset;
    [const] len:u32 = j+length;

    loop(;j<len; i.inc, j.inc)
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

fn  utf8ToCodePoint : u32 (l : Lexer,  data: ParserData){
    [const] buffer: Buffer8 = data.input;
    [mut] index : u32 = l.byte_offset + l.byte_length;
    [mut] a: u8 = buffer[index];
    [mut] flag: u8 = 14;

    if a & 128 : {

        flag =  a & 240;

        [const] b : u8 = buffer[index+1];

        if flag != 240 : {
            //TODO
        } else if flag != 250 : {
            //TODO
        }
    }
}

fn getTypeAt : u32 ( code_point : u32 ) {

    match lookup_table[code_point] & 16 :
        0 : return : TokenSymbol,
        1 : return : TokenIdentifier,
        2 : return : TokenSpace, 
        3 || 4 : return : TokenNewLine,
        5 : return : TokenNumber;
    
    return : TokenSymbol;
}


[pub wasm]cls Lexer {

    [pub] byte_offset:u32 = 0
    [pub] byte_length:u16 = 0
    [pub] token_length:u16 = 0
    [pub] token_offset:u16 = 0
    [pub] prev_token_offset:u32 = 0
    [pub] type:u16 = 0
    [pub] current_byte:u16 = 0

    [pub] fn Lexer : Lexer () { }

    [pub] fn getType : u32 (USE_UNICODE:bool, data: ParserData) { 
        if this.type != 0 :
            if ( not(USE_UNICODE) || this.current_byte < 128) :
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
        return : this.current_byte == 10 || this.current_byte == 13
    }

    [pub] fn isSP : bool  (USE_UNICODE:bool, data:ParserData) {
        return : this.current_byte == 32 || USE_UNICODE && TokenSpace == this.getType(USE_UNICODE, data)
    }

    [pub] fn isNum : bool  (data:ParserData) {
        if this.type == 0 || this.type == TokenNumber : {
            if this.getType(false, data) == TokenNumber : {
                [const] l :u32 = data.input_len;
                off : u32 = this.byte_offset;

                loop ((off.inc < l) && 47 < data.input[off] && data.input[off] < 58)  {
                    this.byte_length.inc;  //++
                    this.token_length.inc; //++
                };

                this.type = TokenFullNumber;
                
                true

            } else 
                return :false
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
                    this.byte_length.inc;
                    prev_byte_len = this.byte_length;
                    this.token_length.inc;
                };
                this.byte_length = prev_byte_len;
                this.type = TokenIdentifierUnicode;
                return:  true;
            }  else 
                return: false
        } else 
            return: this.type == TokenIdentifierUnicode;
    }

    fn copy: void (){
        [const] destination : Lexer = Lexer();
        destination.byte_offset = this.byte_offset;
        destination.byte_length = this.byte_length;
        
        destination.token_length = this.token_length;
        destination.token_offset = this.token_offset;
        destination.prev_token_offset = this.prev_token_offset;
        
        destination.type = this.type;
        destination.current_byte = this.current_byte;

        destination
    }

    fn sync:void (source: Lexer){
        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_token_offset = source.prev_token_offset;
        
        this.type = source.type;
        this.current_byte = source.current_byte;

        this
    }

    fn next:void (data: ParserData){
            
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

        this
    }
    

    fn END:bool (data:ParserData){
        this.byte_offset >= data.input_len
    }
}

[pub] fn assert_ascii:bool(l:Lexer, a:u32, b:u32, c:u32, d:u32) {
    
    [const] ascii : u32 = l.current_byte;

    if (ascii < 32) : {
        
        return : ((a & (1 << ascii)) != 0)

    } else if (ascii < 64) : {
        
        return : ((b & (1 << (ascii - 32))) != 0)

    } else if (ascii < 96) : {

        return : ((c & (1 << (ascii - 64))) != 0)

    } else if (ascii < 128) : {
        
        return : ((d & (1 << (ascii - 96))) != 0)

    };

    false
}

[pub] fn add_shift:void(l:Lexer, data:ParserData, tok_len:u32) {
        
    [const] skip_delta:u32 = l.token_offset - l.prev_token_offset;

    has_skip:bool = skip_delta > 0;
    has_len:bool = tok_len > 0;
    val:u32 = 1;
    
    val |= (skip_delta << 3);
    
    if (has_skip && ((skip_delta > 36863) || (tok_len > 36863))) :{
        add_shift(l, data, 0);
        has_skip = 0;
        val = 1;
    };
    
    val |= (((has_skip << 2) | (has_len << 1)) | (tok_len << (3 + (15 * has_skip))));
    
    set_action(val, data);

    l.prev_token_offset = l.token_offset + l.token_length;
}

fn set_error:void (val:u32, data:ParserData) {
    if(data.error_ptr > data.error_len) : return;
    data.error[data.error_ptr.inc] = val;
}

fn set_action:void (val:u32, data:ParserData) {
    if(data.error_ptr > data.error_len) : return;
    data.error[data.rules_ptr.inc] = val;
}

fn add_reduce:void (state:u32, data:ParserData, sym_len:u32, body:u32, DNP:bool) {
    if (isOutputEnabled(state)) : {
        set_action(((DNP << 1) | ((sym_len & 16383) << 2)) | (body << 16), data);
    };
}

fn createState:u32 (ENABLE_STACK_OUTPUT:bool) {
    [const] IS_STATE_VALID:u32 = 1;
    IS_STATE_VALID | (ENABLE_STACK_OUTPUT << 1);
}

fn hasStateFailed:bool(state:u32) {
    [const] IS_STATE_VALID:u32 = 1;
    return : 0 != (state & IS_STATE_VALID); //==
}

[pub] fn mark:u32 (val:u32, data:ParserData) { action_ptr }

fn isOutputEnabled:bool (state:u32) { 0 < (state & 2) }

fn reset:u32 (mark:u32, origin:Lexer, advanced:Lexer, state:u32) {
    action_ptr = mark;
    advanced.sync(origin);
    state
}

fn consume: bool (l:Lexer, data:ParserData, state:u32) {
    if isOutputEnabled(state) : add_shift(l, data, l.token_length);
    l.next(data);
    true
}

fn assertSuccess: bool (l:Lexer, data:ParserData, condition:bool) {
    if ( /*!*/condition || hasStateFailed(state)) : fail(l, state)
    else state
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

        data.debug_ptr.inc/*++*/;
    };

    data.debug[local_pointer] = ((number_of_items && /*0x3F*/2) 
        | ( delta_char_offset << 6) 
        | ((peek_start & 1) << 12) 
        | ((peek_end & 1) << 13)
        | ((fork_start & 1) << 14) 
        | ((fork_end & 1) << 15));

    data.debug_ptr.inc/*++*/;
}

fn debug_add_item: void([borrow] data:ParserData, item_index:u32) { 
    data.debug[data.debug_ptr.inc/*++*/] = item_index;
}

[pub wasm] fn init_table: Buffer8 (){  lookup_table }


[pub wasm] fn init_data: ParserData(input_len:u32, rules_len:u32, error_len:u32, debug_len:u32){


    [mut sell] data: ParserData;
     
    data.input = Buffer8(input_len);
    data.rules = Buffer8(rules_len);
    data.error = Buffer8(error_len);
    data.debug = Buffer8(debug_len);
    data.input_ptr= 0;
    data.rules_ptr= 0;
    data.error_ptr= 0;
    data.debug_ptr= 0;
    data.input_len= input_len;
    data.rules_len= rules_len;
    data.error_len= error_len;
    data.debug_len= debug_len;

    data;
}

[wasm pub] fn delete_data:void([buy] data:ParserData){
    delete(data)
}
`;

assert_group(1200, sequence, () => {
    assert("A", parser(data).FAILED == false);
    assert("B", parser(data).FAILED == false);
    assert("C", parser(data).FAILED == false);
    assert("D", parser(data).FAILED == false);
    assert("i", parser(data).FAILED == false);
    assert("j", parser(data).FAILED == false);
    assert("k", parser(data).FAILED == false);;
    assert("l", parser(data) == false);
});