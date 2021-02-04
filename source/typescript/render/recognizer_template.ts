import { Helper } from "../compiler/helper.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default, jump16bit_table_byte_size } from "../runtime/parser_memory.js";
import { Grammar } from "../types/grammar.js";
import { RDProductionFunction } from "../types/rd_production_function";
import { addSkipCallNew, getProductionFunctionName } from "../utilities/code_generating.js";
import {
    rec_consume_assert_call, rec_consume_call,
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
    action32bit_array_byte_size = action32bit_array_byte_size_default,
    error8bit_array_byte_size = error8bit_array_byte_size_default
): SC => {

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
    const closure = getProductionClosure(0, grammar);
    const skippable = getSkippableSymbolsFromItems(closure, grammar);
    const unskippable = getUnskippableSymbolsFromClosure(closure, grammar);
    const skip = addSkipCallNew(skippable, grammar, runner, rec_glob_lex_name, unskippable);
    const main = SC.Function(
        "main: bool",
        "input_string:string"
    ).addStatement(
        SC.Assignment(str, "input_string"),

        SC.Declare(
            SC.Assignment(SC.Constant("l:Lexer&"), SC.UnaryPre("new", SC.Call("Lexer:Lexer&")))
        ),
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
