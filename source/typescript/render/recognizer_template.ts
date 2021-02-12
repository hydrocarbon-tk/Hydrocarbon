import { Helper } from "../compiler/helper.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { Grammar } from "../types/grammar.js";
import { RDProductionFunction } from "../types/rd_production_function";
import { createSkipCall, getProductionFunctionName } from "../utilities/code_generating.js";
import {
    rec_glob_data_name,
    rec_glob_lex_name
} from "../utilities/global_names.js";
import { getProductionClosure } from "../utilities/production.js";
import { SC } from "../utilities/skribble.js";
import { getSkippableSymbolsFromItems, getUnskippableSymbolsFromClosure } from "../utilities/symbol.js";

export const renderAssemblyScriptRecognizer = (
    grammar: Grammar,
    runner: Helper,
    rd_functions: RDProductionFunction[],
): SC => {

    const { const: constants_a, fn: const_functions_a } = runner.render_constants();
    const closure = getProductionClosure(0, grammar);
    const skippable = getSkippableSymbolsFromItems(closure, grammar);
    const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
    const skip = createSkipCall(skippable, grammar, runner, SC.Variable("data.lexer"), unskippable);
    return (new SC).addStatement(SC.Value(`
    const lookup_table = new Uint8Array(${jump8bit_table_byte_size});
    const sequence_lookup = [${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")}];
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

    function assertSuccess(l, state, condition) {
        if (!condition || hasStateFailed(state)) 
            return fail(l, state);
        return state;
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
            origin_fork: data.rules_ptr,
            origin: data,
            alternate: null
        };

        while (data.alternate) {
            data = data.alternate;
        }

        data.alternate = fork;

        return fork;
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
    
    `), ...constants_a,
        ...const_functions_a,
        ...rd_functions.filter(f => f.RENDER).map(r => r.fn),
        SC.Function("recognizer:void", "data:ParserData", "input_byte_length:uint32", "production:uint32")
            .addStatement(
                SC.Value("data.input_len = input_byte_length"),
                //SC.Declare(SC.Assignment("l:Lexer", SC.UnaryPre("new", SC.Call("Lexer")))),
                SC.Call(SC.Member("data.lexer", "next"), rec_glob_data_name),
                skip,
                SC.Call("dispatch", "data", "0"),
                SC.Call("run", "data")
            ),
        SC.Value(`
    const data_stack = [];
    function run(data) {
        data_stack.push(data);
        let ACTIVE = true;
        while (ACTIVE) {
            for (const data of data_stack)
                ACTIVE = stepKernel(data,0);
        }
        data_stack.length = 0;
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

    function pushFN(data, fn_ref){ data.stack[++data.stack_ptr] = fn_ref; }

    function init_table(){ return lookup_table;  }
    
    function init_data(input_len, rules_len, error_len, debug_len){

        let 
            input = new Uint8Array(input_len),
            rules = new Uint32Array(rules_len),
            error = new Uint8Array(error_len),
            debug = new Uint16Array(debug_len),
            stack = [];

        return {
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

    function dispatch(data, production_index){
        switch (production_index) {
            ${rd_functions.filter(f => f.RENDER)
                .map((fn, i) => {
                    const name = getProductionFunctionName(grammar[fn.id], grammar);
                    return `case ${i}: pushFN(data, ${name}); return;`;
                }).join("            \n")}
        }
    }

    function delete_data(){};
    `)
    );
};
