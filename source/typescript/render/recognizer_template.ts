import { Grammar } from "../types/grammar.js";
import { SymbolType } from "../types/symbol_type";
import { getProductionFunctionName } from "../util/item_render_functions.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default, jump16bit_table_byte_size } from "../runtime/parser_memory.js";
import { CompilerRunner } from "../compiler/compiler_runner";
import { RDProductionFunction } from "../types/rd_production_function";
import { SC } from "../util/skribble.js";
import {
    convertAssertionFunctionBodyToSkribble,
    TokenSpaceIdentifier,
    TokenNumberIdentifier,
    TokenIdentifierIdentifier,
    TokenNewLineIdentifier,
    TokenSymbolIdentifier,
    rec_consume_call,
    rec_consume_assert_call,
    rec_glob_lex_name,
    rec_state
} from "../util/utilities.js";
import { createLexerCode } from "./lexer_template.js";
import { createStateCode } from "./state_template.js";

export const renderAssemblyScriptRecognizer = (
    grammar: Grammar,
    runner: CompilerRunner,
    rd_functions: RDProductionFunction[],
    action32bit_array_byte_size = action32bit_array_byte_size_default,
    error8bit_array_byte_size = error8bit_array_byte_size_default
): SC => {
    //Constant Values
    const assert_functions = new Map;

    //Identify required assert functions. 
    for (const sym of [...grammar.meta.all_symbols.values()]
        .filter(s => s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)
    ) {
        const fn_name = <string>sym.val;
        if (grammar.functions.has(fn_name)) {
            const val = grammar.functions.get(fn_name),
                sc = convertAssertionFunctionBodyToSkribble(val.txt, grammar, runner).sc;

            assert_functions.set(fn_name, SC.Function(SC.Variable(`__${fn_name}__:bool`), SC.Variable("l:Lexer")).addStatement(sc));
        }
    }

    const
        { const: constants, fn: const_functions } = runner.render_constants(),
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
        action_ptr = SC.Variable("action_ptr:unsigned int"),
        error_ptr = SC.Variable("error_ptr:unsigned int"),
        str = SC.Variable("str:string"),
        FAILED = SC.Variable("FAILED:bool"),
        prod = SC.Variable("prod:int");

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
            SC.Assignment(action_ptr, SC.Value(0)),
            SC.Assignment(error_ptr, SC.Value(0)),
            str,
        ),
        ...constants,
        createStateCode(),
        createLexerCode(),
        ...const_functions,
        ...assert_functions.values()
    );

    //for (const fn of [...grammar.functions.values()].filter(v => v.assemblyscript_txt))
    //    assert_functions.set(fn.id, `function ${getAssertionFunctionName(fn.id)}(l:Lexer&):boolean{${fn.assemblyscript_txt}}`);
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

    /*            
    function reset(mark:u32): boolean{
        if(!FAILED) return false;
        FAILED = false;
        action_ptr = mark;
        return true
    }
    */
    code_node.addStatement(
        SC.Function(
            "reset:boolean",
            "mark:unsigned int",
            "origin:Lexer",
            "advanced:Lexer",
            rec_state,
            "pass:boolean",
        ).addStatement(
            SC.If(
                SC.Binary(
                    SC.UnaryPre("!", SC.Call(SC.Member(rec_state, "getFAILED"))), "&&",
                    "pass")
            ).addStatement(SC.UnaryPre(SC.Return, SC.False)),
            SC.Assignment(action_ptr, "mark:unsigned int"),
            SC.Call(SC.Member("advanced", "sync"), "origin"),
            SC.Call(SC.Member(rec_state, "setFAILED"), SC.False),
            SC.UnaryPre(SC.Return, SC.True)
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
    function add_reduce(sym_len: u32, body: u32, DO_NOT_PUSH_TO_STACK:boolean = false): void {
        const val: u32 = ((0<<0) | ((DO_NOT_PUSH_TO_STACK ? 1 : 0) << 1 ) | ((sym_len & 0x3FFF) << 2) | (body << 16));
        set_action(val);
    }
    */
    code_node.addStatement(
        SC.Function(
            "add_reduce:void",
            rec_state,
            "sym_len:unsigned int",
            "body:unsigned int",
            SC.Assignment("DNP:bool", "false")
        ).addStatement(
            SC.If(SC.Call(SC.Member(rec_state, "getENABLE_STACK_OUTPUT")))
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
            "fail:bool",
            "l:Lexer&",
            rec_state
        ).addStatement(
            SC.If(
                SC.Binary(SC.UnaryPre("!", SC.Call(SC.Member(rec_state, "getFAILED"))),
                    "&&",
                    SC.Call(SC.Member(rec_state, "getENABLE_STACK_OUTPUT"))))
                .addStatement(
                    SC.Call("soft_fail", "l", rec_state)
                ),
            SC.UnaryPre(SC.Return, SC.False)
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
            SC.Call(SC.Member(rec_state, "setFAILED"), "true"),
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
            "assertSuccess:bool",
            "l:Lexer&",
            rec_state,
            "condition:bool",
        ).addStatement(
            SC.If(SC.Binary(SC.UnaryPre("!", SC.Value("condition")), "||", SC.Call(SC.Member(rec_state, "getFAILED"))))
                .addStatement(SC.UnaryPre(SC.Return, SC.Call("fail", "l", rec_state))),
            SC.UnaryPre(SC.Return, SC.True)
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
            SC.If(SC.Call(SC.Member(rec_state, "getENABLE_STACK_OUTPUT"))).addStatement(
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
            SC.If(SC.Call(SC.Member(rec_state, "getFAILED"))).addStatement(
                SC.UnaryPre(SC.Return, SC.Value("false"))
            ),
            SC.If(SC.Variable("accept")).addStatement(
                SC.Call(rec_consume_call, "l", rec_state),
                SC.UnaryPre(SC.Return, SC.Value("true")),
                SC.If().addStatement(
                    SC.UnaryPre(SC.Return, SC.Value("false"))
                )
            ),
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

    /*            
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
    }*/
    code_node.addStatement(
        SC.Function(
            "main: bool",
            "input_string:string"
        ).addStatement(
            SC.Assignment(str, "input_string"),

            SC.Declare(
                SC.Assignment(SC.Constant("l:Lexer&"), SC.UnaryPre("new", SC.Call("Lexer:Lexer&"))),
                SC.Assignment(SC.Constant("state:State&"), SC.UnaryPre("new", SC.Call("State:State&")))
            ),

            SC.Call(SC.Member("l", "next")),
            SC.Call("reset_counters_and_pointers"),

            SC.Call(getProductionFunctionName(grammar[0], grammar), "l", "state:State&"),
            //addSkipCallNew(getSkippableSymbolsFromItems(getProductionClosure(0, grammar), grammar), grammar, runner),
            SC.Call("set_action", 0),
            SC.Call("set_error", 0),
            SC.UnaryPre(SC.Return, SC.Binary(
                SC.Call(SC.Member("state", SC.Variable("getFAILED:bool"))),
                "||",
                SC.UnaryPre("!", SC.Call(SC.Member("l", "END")))))
        ));
    return code_node;
};