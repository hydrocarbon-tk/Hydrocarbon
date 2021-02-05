import { Helper } from "../compiler/helper.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { Grammar } from "../types/grammar.js";
import { RDProductionFunction } from "../types/rd_production_function";
import { createSkipCall, getProductionFunctionName } from "../utilities/code_generating.js";
import {
    rec_consume_assert_call, rec_consume_call,
    rec_glob_data_name,
    rec_glob_lex_name,
    rec_state, TokenIdentifierIdentifier,
    TokenNewLineIdentifier, TokenNumberIdentifier, TokenSpaceIdentifier,
    TokenSymbolIdentifier
} from "../utilities/global_names.js";
import { getProductionClosure } from "../utilities/production.js";
import { SC, VarSC } from "../utilities/skribble.js";
import { getSkippableSymbolsFromItems, getUnskippableSymbolsFromClosure } from "../utilities/symbol.js";
import { createLexerCode } from "./lexer_template.js";
import { createStateCode } from "./state_template.js";

export const renderAssemblyScriptRecognizer = (
    grammar: Grammar,
    runner: Helper,
    rd_functions: RDProductionFunction[],
    action32bit_array_byte_size = 0,
    error8bit_array_byte_size = 0
): SC => {

    const { const: constants_a, fn: const_functions_a } = runner.render_constants();
    const closure = getProductionClosure(0, grammar);
    const skippable = getSkippableSymbolsFromItems(closure, grammar);
    const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
    const skip = createSkipCall(skippable, grammar, runner, rec_glob_lex_name, unskippable);
    return (new SC).addStatement(SC.Value(`
    const lookup_table = new Uint8Array(${jump8bit_table_byte_size});
    const sequence_lookup = [${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")}];
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
    
    `), ...constants_a,
        ...const_functions_a,
        ...rd_functions.filter(f => f.RENDER).map(r => r.fn),
        SC.Function("recognizer:void", "data:ParserData", "production:uint32")
            .addStatement(
                SC.Declare(SC.Assignment("l:Lexer", SC.UnaryPre("new", SC.Call("Lexer")))),
                SC.Call(SC.Member("l", "next"), rec_glob_data_name),
                skip,
                SC.Call(getProductionFunctionName(grammar[0], grammar), "l", "data", SC.Call("createState", "1"))
            ),
        SC.Value(`

    function delete_data(){};
    `)
    );

    //Constant Values
    const hasStateFailed = SC.Call("hasStateFailed", rec_state);
    const isOutputEnabled = SC.Call("isOutputEnabled", rec_state);

    const
        code_node = new SC,
        action_array_offset = SC.Constant("action_array_offset:unsigned int"),
        error_array_offset = SC.Constant("error_array_offset:unsigned int"),
        TokenSpace = SC.Constant("TokenSpace:unsigned int"),
        TokenNumber = SC.Constant("TokenNumber:unsigned int"),
        TokenIdentifier = SC.Constant("TokenIdentifier:unsigned int"),
        TokenNewLine = SC.Constant("TokenNewLine:unsigned int"),
        TokenSymbol = SC.Constant("TokenSymbol:unsigned int"),
        id = SC.Constant("id:unsigned short"),
        num = SC.Constant("num:unsigned short"),
        debug_ptr = SC.Variable("debug_ptr:unsigned int"),
        action_ptr = SC.Variable("action_ptr:unsigned int"),
        error_ptr = SC.Variable("error_ptr:unsigned int"),
        str = SC.Variable("str:string");


    /** 
     * Construct main function before processing runner constants to
     * allow a skip function to be added right before call to goal
     * production function
    
    export default function main (input_string:string): boolean {

        str = input_string;

        const lex = new Lexer();

        lex.next();

        reset_counters_and_pointers();

        $${grammar[0].name}(lex);

        //consume any remaining skippable tokens

        ${addSkipCall(grammar, runner, undefined, "lex")}

        set_action(0);

        set_error(0);

        return FAILED || !lex.END;    
    }
    */

    const main = SC.Function(
        "main: bool",
        "input_string:string"
    ).addStatement(
        SC.Assignment(str, "input_string"),

        SC.Declare(SC.Assignment(SC.Constant("l:Lexer&"), SC.UnaryPre("new", SC.Call("Lexer:Lexer&")))),
        SC.Call(SC.Member("l", "next")),
        SC.Call("reset_counters_and_pointers"),
        skip,
        SC.Declare(SC.Assignment(rec_state, SC.Call(getProductionFunctionName(grammar[0], grammar), "l", SC.Call("createState", "1")))),
        SC.Call("set_action", 0),
        SC.Call("set_error", 0),
        SC.UnaryPre(SC.Return, SC.Binary(
            hasStateFailed,
            "||",
            SC.UnaryPre("!", SC.Call(SC.Member("l", "END")))))
    );

    const { const: constants, fn: const_functions } = runner.render_constants();

    code_node.addStatement(
        SC.Declare(
            SC.Assignment(action_array_offset, SC.Value(jump16bit_table_byte_size)),
            SC.Assignment(error_array_offset, SC.Value((jump16bit_table_byte_size) + (action32bit_array_byte_size))),
            SC.Assignment(TokenSpace, SC.Value(TokenSpaceIdentifier)),
            SC.Assignment(TokenNumber, SC.Value(TokenNumberIdentifier)),
            SC.Assignment(TokenIdentifier, SC.Value(TokenIdentifierIdentifier)),
            SC.Assignment(TokenNewLine, SC.Value(TokenNewLineIdentifier)),
            SC.Assignment(TokenSymbol, SC.Value(TokenSymbolIdentifier)),
            SC.Assignment(id, SC.Value(2)),
            SC.Assignment(num, SC.Value(4)),
            SC.Assignment(debug_ptr, SC.Value(0)),
            SC.Assignment(action_ptr, SC.Value(0)),
            SC.Assignment(error_ptr, SC.Value(0)),
            str,
        ),
        ...constants,
        createStateCode(),
        createLexerCode(),
        ...const_functions,
    );
    /*
    function set_error(val: u32): void {
        if(error_ptr >= 128) return;
        store<u32>(((error_ptr++ & 0xFF) << 2) + error_array_offset, val);
    }
    */
    code_node.addStatement(SC.Function("set_error:void", "val:unsigned int").addStatement(
        SC.If(SC.Binary(error_ptr, ">=", error8bit_array_byte_size / 4)).addStatement(SC.Return),
        SC.Call(
            SC.Constant("store:void", ":unsigned int"),
            SC.Binary(SC.Binary(SC.UnaryPost(error_ptr, "++"), "<<", 2), "+", error_array_offset), "val:unsigned int")
    ));
    /*            
    function set_action(val: u32):void{
        store<u32>(((action_ptr++) << 2) + (action_array_offset), val);
    }
    */
    code_node.addStatement(
        SC.Function("set_action:void", "val:unsigned int"
        ).addStatement(
            SC.Call(
                SC.Constant("store:void", ":unsigned int"),
                SC.Binary(SC.Binary(SC.UnaryPost(action_ptr, "++"), "<<", 2), "+", action_array_offset), "val:unsigned int"))
    );

    /*            
    function mark (): u32{
        mark_ = action_ptr;
        return mark_;
    }
    */
    code_node.addStatement(SC.Function(
        "mark:unsigned int")
        .addStatement(
            SC.UnaryPre("return", action_ptr)
        ));
    /*
    function table(l:Lexer, a,b,c,d): bool{
        const utf = 1 << l.utf;
        if(utf < 32)
            return a & (1 << utf);
        else if (utf < 64)
            return b & (1 << (utf - 32));
        else if (utf < 96)
            return c & (1 << (utf - 64));
        else if (utf < 128)
            return d & (1 << (utf - 96));
        return false
    }
     */
    code_node.addStatement(
        SC.Function(
            "assert_table:boolean",
            rec_glob_lex_name,
            "a:unsigned int",
            "b:unsigned int",
            "c:unsigned int",
            "d:unsigned int",
        ).addStatement(
            SC.Declare(SC.Assignment(SC.Constant("utf:int"), SC.Member(rec_glob_lex_name, "utf"))),
            SC.If(SC.Binary("utf", "<", "32"))
                .addStatement(
                    SC.UnaryPre(SC.Return, SC.Binary(SC.Binary("a", "&", SC.Binary("1", "<<", "utf")), "!=", "0")),
                    SC.If(SC.Binary("utf", "<", "64"))
                        .addStatement(
                            SC.UnaryPre(SC.Return, SC.Binary(SC.Binary("b", "&", SC.Binary("1", "<<", SC.Binary("utf", "-", "32"))), "!=", "0")),
                            SC.If(SC.Binary("utf", "<", "96"))
                                .addStatement(
                                    SC.UnaryPre(SC.Return, SC.Binary(SC.Binary("c", "&", SC.Binary("1", "<<", SC.Binary("utf", "-", "64"))), "!=", "0")),
                                    SC.If(SC.Binary("utf", "<", "128"))
                                        .addStatement(
                                            SC.UnaryPre(SC.Return, SC.Binary(SC.Binary("d", "&", SC.Binary("1", "<<", SC.Binary("utf", "-", "96"))), "!=", "0"))
                                        )
                                )
                        ),
                ),
            SC.UnaryPre(SC.Return, SC.False),
        ));

    code_node.addStatement(SC.Value(`
    
    function utf8_1(l, index) {
        return load(data_ptr + l.off) == index;
    }

    function utf8_2(l, index) {
        const
            a = load(data_ptr + l.off),
            b = load(data_ptr + l.off + 1);
        if (((a & 0b11100000) == 0b11000000)
            && index == (a & 0b00111111 << 6) | (b & 0b00111111)) {
            l.bl += 2;
            l.tl += 1;
            return true;
        }
        return false;
    }

    function utf8_3(l, index) {

        const
            a = load(data_ptr + l.off),
            b = load(data_ptr + l.off + 1),
            c = load(data_ptr + l.off + 2);

        return ((a & 0b11110000) == 0b11100000)
            && index == (a & 0b00001111 << 12) | ((b & 0b00111111) << 6) | (b & 0b00111111);
    }

    function utf8_4(l, index) {

        const
            a = load(data_ptr + l.off),
            b = load(data_ptr + l.off + 1),
            c = load(data_ptr + l.off + 2),
            c = load(data_ptr + l.off + 3);

        return ((a & 0b11111000) == 0b11110000)
            && index == ((a & 0b00000111) << 18) | ((b & 0b00111111) << 6) | ((b & 0b00111111) << 6) | (b & 0b00111111);
    }
    
    `));

    /*            
    function reset(mark:u32, state): unsigned int{
        if(!FAILED) return false;
        FAILED = false;
        action_ptr = mark;
        return state
    }
    */
    code_node.addStatement(
        SC.Function(
            "reset:unsigned",
            "mark:unsigned int",
            "origin:Lexer",
            "advanced:Lexer",
            rec_state,
        ).addStatement(
            SC.Assignment(action_ptr, "mark:unsigned int"),
            SC.Call(SC.Member("advanced", "sync"), "origin"),
            SC.UnaryPre(SC.Return, rec_state)
        ));

    /*            
    function add_shift(l:Lexer&, char_len: u32): void {
        const skip_delta = l.getOffsetRegionDelta();
        
        let has_skip: u32 = +(skip_delta > 0),
            has_len: u32 =  +(char_len > 0),
            val:u32 = 1;
        
        val |= skip_delta << 3;
        
        if(has_skip && (skip_delta > 0x8FFF || char_len > 0x8FFF)){
            add_shift(l, 0);
            has_skip = 0;
            val = 1;
        }

        val |= (has_skip<<2) | (has_len<<1) | char_len << (3 + 15 * has_skip);
        
        set_action(val);
        
        l.advanceOffsetRegion();
    }
    */
    const
        lexer = SC.Constant("l:Lexer&"),
        char_len = SC.Constant("char_len:unsigned int"),
        skip_delta = SC.Constant("skip_delta:unsigned int"),
        has_skip = SC.Variable("has_skip:unsigned int"),
        has_len = SC.Variable("has_len:unsigned int"),
        val = SC.Variable("val:unsigned int");

    code_node.addStatement(
        SC.Function(
            "add_shift:void",
            lexer,
            char_len
        ).addStatement(
            SC.Declare(
                SC.Assignment(skip_delta, SC.Call(SC.Member(lexer, "getOffsetRegionDelta:unsigned int"))),
                SC.Assignment(has_skip, SC.Binary(skip_delta, ">", 0)),
                SC.Assignment(has_len, SC.Binary(char_len, ">", 0)),
                SC.Assignment(val, 1)
            ),
            SC.Binary(val, "|=", SC.Binary(skip_delta, "<<", 3)),
            SC.If(
                SC.Binary(has_skip, "&&", SC.Group("(", SC.Binary(SC.Binary(skip_delta, ">", 0x8FFF), "||", SC.Binary(char_len, ">", 0x8FFF))))
            ).addStatement(
                SC.Call("add_shift:void", lexer, 0),
                SC.Assignment(has_skip, 0),
                SC.Assignment(val, 1),
            ),
            SC.Binary(val, "|=", SC.Binary(SC.Binary(SC.Binary(has_skip, "<<", 2), "|", SC.Binary(has_len, "<<", 1)), "|", SC.Binary(char_len, "<<", SC.Binary(3, "+", SC.Binary(15, "*", has_skip))))),
            SC.Call("set_action:void", val),
            SC.Call(SC.Member(lexer, "advanceOffsetRegion"))
        ));

    /*            
    function add_reduce(state,sym_len,body,DNP = false){
        if(state.getENABLE_STACK_OUTPUT()){
            set_action(((DNP<<1)|((sym_len&16383)<<2))|(body<<16));
        }
    } */
    code_node.addStatement(
        SC.Function(
            "add_reduce:void",
            rec_state,
            "sym_len:unsigned int",
            "body:unsigned int",
            SC.Assignment("DNP:bool", "false")
        ).addStatement(
            SC.If(isOutputEnabled)
                .addStatement(
                    SC.Call("set_action",
                        SC.Binary(
                            SC.Binary(SC.Binary("DNP", "<<", 1), "|", SC.Binary(SC.Binary("sym_len", "&", 0x3FFF), "<<", 2)),
                            "|", SC.Binary("body", "<<", 16))
                    )
                )
        ));
    /*            
   function fail(lex:Lexer&):boolean { 
        if(!FAILED){
            prod = -1;
            soft_fail(lex)
        }
        return false;
    }  */
    code_node.addStatement(
        SC.Function(
            "fail:unsigned",
            "l:Lexer&",
            rec_state
        ).addStatement(
            SC.If(
                SC.Binary(
                    SC.UnaryPre("!", hasStateFailed),
                    "&&",
                    isOutputEnabled))
                .addStatement(
                    SC.Call("soft_fail", "l", rec_state)
                ),
            SC.UnaryPre(SC.Return, SC.Value("0"))
        ));

    /*            
   function soft_fail(lex:Lexer&):void { 
        FAILED = true;
        set_error(lex.off);
    }
    */
    code_node.addStatement(
        SC.Function(
            "soft_fail:void",
            "l:Lexer&",
            rec_state,
        ).addStatement(
            SC.Call("set_error", SC.Member("l", "off"))
        ));


    /*            
   function isSUCCESS(lex: Lexer, condition:bool):void {
       if(FAILED || !condition) return fail(lex);
       return true;
   }
  */
    code_node.addStatement(
        SC.Function(
            "assertSuccess:unsigned",
            "l:Lexer&",
            rec_state,
            "condition:bool",
        ).addStatement(
            SC.If(SC.Binary(SC.UnaryPre("!", SC.Value("condition")), "||", hasStateFailed))
                .addStatement(SC.UnaryPre(SC.Return, SC.Call("fail", "l", rec_state))),
            SC.UnaryPre(SC.Return, rec_state)
        ));
    /*            
    function _no_check(lex: Lexer):void {
        add_shift(lex, lex.tl);
        lex.next();
    }
   */

    code_node.addStatement(
        SC.Function(
            rec_consume_call,
            "l:Lexer&",
            rec_state,
        ).addStatement(
            SC.If(isOutputEnabled).addStatement(
                SC.Call("add_shift", "l", SC.Member("l:Lexer&", "tl"))
            ),
            SC.Call(SC.Member("l:Lexer&", "next"))
        ));

    const empty_consume_call = SC.Constant("consume_empty:void");

    code_node.addStatement(
        SC.Function(
            empty_consume_call,
            "l:Lexer&",
        ).addStatement(
            SC.Call("add_shift", "l", SC.Value(0))
        ));

    /*            
    function consume_assert(lex: Lexer, accept:boolean):void {
 
        if(FAILED) 
            return false
        
        if (accept) {
            consume(lex);
        } else {
          return false;
        }
    }
   */
    code_node.addStatement(
        SC.Function(
            rec_consume_assert_call,
            "l:Lexer&",
            rec_state,
            "accept:bool"
        ).addStatement(
            SC.If(hasStateFailed)
                .addStatement(
                    SC.UnaryPre(SC.Return, SC.Value("0"))
                ),
            SC.If(SC.Variable("accept")).addStatement(
                SC.Call(rec_consume_call, "l", rec_state),
                SC.UnaryPre(SC.Return, SC.Value("state")),
                SC.If().addStatement(
                    SC.UnaryPre(SC.Return, SC.Value("0"))
                )
            ),

        ));

    /**
     * function debug_add_header(number_of_items, delta_char_offset, peek_start, peek_end, fork_start, fork_end) {
     *      
     *      const local_pointer = debug_pointer;
     *      
     *      if(delta_char_offset > 62){
     * 
                store(local_pointer+1,delta_char_offset);
     * 
     *          delta_char_offset = 63;
     * 
     *          debug_pointer++;
     *      }
     *          store(local_pointer, (number_of_items && 0x3F) 
     *              | ( delta_char_offset << 6) 
     *              | ((peek_start & 0x1) << 12) 
     *              | ((peek_end & 0x1) << 13)
     *              | ((fork_start & 0x1) << 14) 
     *              | ((fork_end & 0x1) << 15));
     * 
     *          debug_pointer++;
     * }
     */
    const noi = SC.Variable("number_of_items:uint32");
    const dco = SC.Variable("delta_char_offset:uint32");
    const pks = SC.Variable("peek_start:bool");
    const pke = SC.Variable("peek_end:bool");
    const fks = SC.Variable("fork_start:bool");
    const fke = SC.Variable("fork_end:bool");
    const lptr = SC.Variable("local_pointer:uint3");
    code_node.addStatement(
        SC.Function(
            "debug_add_header:void",
            noi, dco, pks, pke, fks, fke
        ).addStatement(
            SC.Declare(SC.Assignment(lptr, debug_ptr)),
            SC.If(SC.Binary(dco, ">", "62"))
                .addStatement(
                    SC.Call("store", SC.Binary(lptr, "+", 1), dco),
                    SC.Assignment(dco, 63),
                    SC.UnaryPost(debug_ptr, "++"),
                ),
            SC.Call("store", lptr,
                SC.Binary(SC.Binary(noi, "&", 0x3F), "|",
                    SC.Binary(SC.Binary(dco, "<<", 6), "|",
                        SC.Binary(SC.Binary(SC.Binary(pks, "&", 1), "<<", 12), "|",
                            SC.Binary(SC.Binary(SC.Binary(pke, "&", 1), "<<", 13), "|",
                                SC.Binary(SC.Binary(SC.Binary(fks, "&", 1), "<<", 14), "|",
                                    SC.Binary(SC.Binary(fke, "&", 1), "<<", 15))))))

            ),
            SC.UnaryPost(debug_ptr, "++"),
        )
    );

    /**
    * function debug_add_item(item_index) { 
    *       debug_array[debug_pointer++] = item_index;
    * }
    */
    code_node.addStatement(SC.Function(
        "debug_add_item:void",
        "item_index:uint16"
    ).addStatement(
        SC.Call("store", debug_ptr, "item_index"),
        SC.UnaryPost(debug_ptr, "++")
    ));

    /*            
    function reset_counters_and_pointers(): void{
        prod = -1; 
 
        stack_ptr = 0;
 
        error_ptr = 0;
 
        action_ptr = 0;
 
        FAILED = false;
    }*/
    code_node.addStatement(
        SC.Function(
            "reset_counters_and_pointers:void"
        ).addStatement(
            SC.Assignment(error_ptr, 0),
            SC.Assignment(action_ptr, 0)
        ));

    //#######################################################################
    //######################### Main recognizer functions

    for (const fn of rd_functions.filter(f => f.RENDER))
        code_node.addStatement(fn.fn);

    //#######################################################################

    code_node.addStatement(main);

    return code_node;
};
