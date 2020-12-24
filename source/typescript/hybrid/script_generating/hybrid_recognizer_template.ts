import { Grammar, SymbolType } from "../../types/grammar.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default, jump16bit_table_byte_size } from "../parser_memory.js";
import { CompilerRunner } from "../types/CompilerRunner";
import { RDProductionFunction } from "../types/RDProductionFunction";
import { SC } from "../utilities/skribble.js";
import {
    addSkipCall,
    convertAssertionFunctionBodyToSkribble,
    TokenSpaceIdentifier,
    TokenNumberIdentifier,
    TokenIdentifierIdentifier,
    TokenNewLineIdentifier,
    TokenSymbolIdentifier,
    consume_call,
    consume_skip_call,
    consume_assert_skip_call,
    consume_assert_call
} from "../utilities/utilities.js";
import { printLexer } from "./hybrid_lexer_template.js";
import { getTokenSelectorStatements } from "./hybrid_token_selector_template.js";

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
        custom_skip = (grammar?.functions.has("custom_skip") ? (() => {
            let str = grammar.functions.get("custom_skip").txt;
            return [convertAssertionFunctionBodyToSkribble(str, grammar, runner).sc];
        })() : []),
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
        mark_ = SC.Variable("mark_:unsigned int"),
        action_ptr = SC.Variable("action_ptr:unsigned int"),
        error_ptr = SC.Variable("error_ptr:unsigned int"),
        stack_ptr = SC.Variable("stack_ptr:unsigned int"),
        str = SC.Variable("str:string"),
        FAILED = SC.Variable("FAILED:bool"),
        prod = SC.Variable("prod:int"),
        probe_index = SC.Variable("probe_index:unsigned int");

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
            SC.Assignment(mark_, SC.Value(0)),
            SC.Assignment(action_ptr, SC.Value(0)),
            SC.Assignment(error_ptr, SC.Value(0)),
            SC.Assignment(stack_ptr, SC.Value(0)),
            SC.Assignment(FAILED, SC.Value("false")),
            SC.Assignment(prod, SC.Value("-1")),
            SC.Assignment(probe_index, SC.Value("1")),
            str,
        ),
        ...constants,
        printLexer(),
        ...const_functions,
        ...assert_functions.values()
    );

    const fns = [
        ...rd_functions.filter(l => l.RENDER).map(fn => fn.str),
    ],
        { keywords, symbols } = getTokenSelectorStatements(grammar);

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
    function completeProduction(body: u32, len: u32, production: u32): void {
        add_reduce(len, body);
        prod = production;
    }
    */
    code_node.addStatement(SC.Function(
        "completeProduction:void",
        "body:unsigned int",
        "len:unsigned int",
        "production:unsigned int"
    ).addStatement(
        SC.Call(SC.Constant("add_reduce:unsigned int"), SC.Constant("body:unsigned int"), SC.Constant("len:unsigned int")),
        SC.Assignment(prod, SC.Constant("production:unsigned int"))
    ));
    /*            
    function completeProductionPlain(len: u32, production: u32): void {
        prod = production;
    }
    */
    code_node.addStatement(SC.Function(
        "completeProductionPlain:void",
        "len:unsigned int",
        "production:unsigned int"
    ).addStatement(
        SC.Assignment(prod, SC.Constant("production:unsigned int"))
    ));

    /*            
    function mark (): u32{
        mark_ = action_ptr;
        return mark_;
    }
    */
    code_node.addStatement(SC.Function(
        "mark:unsigned int")
        .addStatement(
            SC.Assignment(mark_, action_ptr),
            SC.UnaryPre("return", mark_)
        ));

    /*            
    function reset(mark:u32): void{
        FAILED = false;
        action_ptr = mark;
    }
    */
    code_node.addStatement(
        SC.Function(
            "reset:boolean",
            "mark:unsigned int",
        ).addStatement(
            SC.Assignment(action_ptr, "mark:unsigned int"),
            SC.Assignment(FAILED, SC.False),
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
            "sym_len:unsigned int",
            "body:unsigned int",
            SC.Assignment("DNP:bool", "false")
        ).addStatement(
            SC.Call("set_action",
                SC.Binary(
                    SC.Binary(SC.Binary("DNP", "<<", 1), "|", SC.Binary(SC.Binary("sym_len", "&", 0x3FFF), "<<", 2)),
                    "|", SC.Binary("body", "<<", 16))
            )
        ));
    /*            
   function fail(lex:Lexer&):boolean { 
        if(!FAILED){
            prod = -1;
            soft_fail(lex)
        }
        return false;
    }

    */
    code_node.addStatement(
        SC.Function(
            "fail:bool",
            "l:Lexer&"
        ).addStatement(
            SC.If(SC.UnaryPre("!", FAILED))
                .addStatement(
                    SC.Assignment(prod, -1),
                    SC.Call("soft_fail", "l")
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
            "l:Lexer&"
        ).addStatement(
            SC.Assignment(FAILED, "true"),
            SC.Call("set_error", SC.Member("l", "off"))
        ));
    /*            
    function setProduction(production: u32):void{
        prod = (-FAILED) +  (-FAILED+1) * production;
    }  
   */
    code_node.addStatement(
        SC.Function(
            "setProduction:void",
            "production:unsigned int"
        ).addStatement(
            SC.Assignment(prod, "production"),
        ));
    /*            
    function _pk(l: Lexer, skip: BooleanTokenCheck): Lexer {
        l.next();
        _skip(l, skip);
        return l;
    }  
   */
    code_node.addStatement(
        SC.Function(
            "_pk:Lexer&",
            "l:Lexer&",
            "skip: BooleanTokenCheck"
        ).addStatement(
            SC.Call(SC.Member("l:Lexer&", "next")),
            SC.Call("_skip", "l", "skip"),
            SC.UnaryPre("return", SC.Variable("l"))
        ));
    ////////////////////////////////////////////////////////////
    `function _skip(l: Lexer, skip: BooleanTokenCheck):Lexer{
        while(1){
    
            ${grammar?.functions.has("custom_skip") ? (() => {
            let str = grammar.functions.get("custom_skip").txt;
            return convertAssertionFunctionBodyToSkribble(str, grammar, runner).sc;
        })() : ""}
            
            if (!skip(l))
                break;
    
            l.next();
        }
    }`;
    code_node.addStatement(
        SC.Function(
            "_skip:Lexer",
            "l:Lexer&",
            "skip: BooleanTokenCheck"
        ).addStatement(
            SC.While(SC.Value(1)).addStatement(
                ...custom_skip,
                SC.If(SC.UnaryPre("!", SC.Call("skip", "l")))
                    .addStatement(SC.Break),
                SC.Call(SC.Member("l", "next")),
            ),
            SC.UnaryPre(SC.Return, SC.Value("l"))
        ));
    /*            
    function _no_check_with_skip(lex: Lexer, skip: BooleanTokenCheck):void {
        add_shift(lex, lex.tl);
        lex.next();
        _skip(lex, skip);
    }
   */
    code_node.addStatement(
        SC.Function(
            consume_skip_call,
            "l:Lexer&",
            "skip: BooleanTokenCheck"
        ).addStatement(
            SC.Call("add_shift", "l", SC.Member("l:Lexer&", "tl")),
            SC.Call(SC.Member("l:Lexer&", "next")),
            SC.Call("_skip", "l", "skip"),
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
            "condition:bool",
        ).addStatement(
            SC.If(SC.Binary(SC.UnaryPre("!", SC.Value("condition")), "||", FAILED))
                .addStatement(SC.UnaryPre(SC.Return, SC.Call("fail", "l"))),
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
            consume_call,
            "l:Lexer&",
        ).addStatement(
            SC.Call("add_shift", "l", SC.Member("l:Lexer&", "tl")),
            SC.Call(SC.Member("l:Lexer&", "next"))
        ));
    /*            
    function _with_skip(lex: Lexer, skip: BooleanTokenCheck, accept:boolean):void {
        if(FAILED) return;
        
        if (accept) {
            _no_check_with_skip(lex, skip);
        } else {
            //TODO error recovery
            soft_fail(lex);
        }
    }
   */
    code_node.addStatement(
        SC.Function(
            consume_assert_skip_call,
            "l:Lexer&",
            "skip: BooleanTokenCheck",
            "accept:bool"
        ).addStatement(
            SC.If(FAILED)
                .addStatement(SC.Return,
                    SC.If(SC.Variable("accept:bool"))
                        .addStatement(
                            SC.Call(consume_skip_call, "l", "skip"),
                            SC.If()
                                .addStatement(
                                    SC.Call("soft_fail", "l"),
                                )
                        )
                )
        ));
    /*            
    function _(lex: Lexer, accept:boolean):void {

        if(FAILED) {

        prod = 1001;
        probe(lex);
            return
        };
        
        if (accept) {
            _no_check(lex);
        } else {

        prod = 1221;
        probe(lex);
            //TODO error recovery
            soft_fail(lex);
        }
    }
   */
    code_node.addStatement(
        SC.Function(
            consume_assert_call,
            "l:Lexer&",
            "accept:bool"
        ).addStatement(
            SC.If(FAILED).addStatement(
                //SC.Assignment(prod, 1001),
                //SC.Call("probe", "l"),
                SC.UnaryPre(SC.Return, SC.Value("false"))
            ),
            SC.If(SC.Variable("accept")).addStatement(
                SC.Call(consume_call, "l"),
                SC.UnaryPre(SC.Return, SC.Value("true")),
                SC.If().addStatement(
                    // SC.Assignment(prod, 1221),
                    // SC.Call("probe", "l"),
                    SC.Call("soft_fail", "l"),
                    SC.UnaryPre(SC.Return, SC.Value("false"))
                )
            ),
        ));
    /*            
    function probe(l: Lexer, id: u32 = 1): void {
        set_error(0xF000000F + (id << 16) + (prob_index << 4));
        set_error(l.ty);
        set_error(l.tl);
        set_error(l.off);
        set_error(prod);
        set_error(action_ptr);
        set_error(FAILED);
        set_error(0xF000000F + (id << 16) + ((prob_index++) << 4));
    }
   */
    code_node.addStatement(
        SC.Function(
            "probe:void",
            "l:Lexer&",
        ).addStatement(
            SC.Call("set_error", SC.Binary("0xF000000F", "+", SC.Binary(SC.Binary("id", "<<", 16), "+", SC.Binary(probe_index, "<<", 4)))),
            SC.Call("set_error", SC.Member("l", "ty")),
            SC.Call("set_error", SC.Member("l", "tl")),
            SC.Call("set_error", SC.Member("l", "off")),
            SC.Call("set_error", prod),
            SC.Call("set_error", action_ptr),
            SC.Call("set_error", FAILED),
            SC.Call("set_error", SC.Binary("0xF000000F", "+", SC.Binary(SC.Binary("id", "<<", 16), "+", SC.Binary(SC.UnaryPost(probe_index, "++"), "<<", 4)))),
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
            SC.Assignment(prod, -1),
            SC.Assignment(stack_ptr, 0),
            SC.Assignment(error_ptr, 0),
            SC.Assignment(action_ptr, 0),
            SC.Assignment(FAILED, "false")
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
            SC.Declare(SC.Assignment(SC.Constant("l:Lexer&"), SC.UnaryPre("new", SC.Call("Lexer:Lexer&")))),
            SC.Call(SC.Member("l", "next")),
            SC.Call("reset_counters_and_pointers"),
            SC.Call("$" + grammar[0].name, "l"),
            addSkipCall(grammar, runner, undefined, SC.Constant("l")),
            SC.Call("set_action", 0),
            SC.Call("set_error", 0),
            SC.UnaryPre(SC.Return, SC.Binary(FAILED, "||", SC.UnaryPre("!", SC.Call(SC.Member("l", "END")))))
        ));
    return code_node;
};