import { Grammar, SymbolType } from "../../types/grammar.js";
import { CompilerRunner } from "../types/CompilerRunner";
import { RDProductionFunction } from "../types/RDProductionFunction";
import { RDState } from "../types/State";
import { SC } from "../utilities/skribble.js";
import { convertAssertionFunctionBodyToSkribble } from "../utilities/utilities.js";
import { printLexer } from "./hybrid_lexer_template.js";
import { getTokenSelectorStatements } from "./hybrid_token_selector_template.js";

export const renderTypeScriptRecognizer = (
    grammar: Grammar,
    runner: CompilerRunner,
    rd_functions: RDProductionFunction[],
    lr_states: RDState[]
) => {

    //Constant Values
    const
        action_array_offset = runner.add_constant(SC.Constant("action_array_offset", ""), SC.Value(191488 << 1)),
        error_array_offset = runner.add_constant(SC.Constant("error_array_offset", ""), SC.Value((191488 << 1) + (1048576 << 2))),
        TokenSpace = runner.add_constant(SC.Constant("TokenSpace", "unsigned int"), SC.Value(1)),
        TokenNumber = runner.add_constant(SC.Constant("TokenNumber", "unsigned int"), SC.Value(2)),
        TokenIdentifier = runner.add_constant(SC.Constant("TokenIdentifier", "unsigned int"), SC.Value(3)),
        TokenNewLine = runner.add_constant(SC.Constant("TokenNewLine", "unsigned int"), SC.Value(4)),
        TokenSymbol = runner.add_constant(SC.Constant("TokenSymbol", "unsigned int"), SC.Value(5)),
        TypeSymbol = runner.add_constant(SC.Constant("TypeSymbol", "unsigned int"), SC.Value(6)),
        TokenKeyword = runner.add_constant(SC.Constant("TokenKeyword", "unsigned int"), SC.Value(7)),
        id = runner.add_constant(SC.Constant("id", "unsigned short"), SC.Value(2)),
        num = runner.add_constant(SC.Constant("num", "unsigned short"), SC.Value(4)),
        mark_ = runner.add_constant(SC.Variable("mark_", "unsigned int"), SC.Value(0)),
        action_ptr = runner.add_constant(SC.Variable("action_ptr", "unsigned int"), SC.Value(0)),
        error_ptr = runner.add_constant(SC.Variable("error_ptr", "unsigned int"), SC.Value(0)),
        stack_ptr = runner.add_constant(SC.Variable("stack_ptr", "unsigned int"), SC.Value(0)),
        str = runner.add_constant(SC.Variable("str", "string"), SC.Value(0)),
        FAILED = runner.add_constant(SC.Variable("FAILED", "boolean"), SC.Value("false")),
        prod = runner.add_constant(SC.Variable("prod", "int"), SC.Value(-1));


    const fns = [
        ...rd_functions.filter(l => l.RENDER).map(fn => fn.str),
        ...lr_states.filter(s => s.REACHABLE).map(s => s.function_string)
    ],
        { keywords, symbols } = getTokenSelectorStatements(grammar),
        assert_functions = new Map;

    //Identify required assert functions. 
    for (const sym of [...grammar.meta.all_symbols.values()]
        .filter(s => s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)
    ) {
        const fn_name = <string>sym.val;
        if (grammar.functions.has(fn_name)) {
            const val = grammar.functions.get(fn_name),
                txt = convertAssertionFunctionBodyToSkribble(val.txt, grammar, runner);

            assert_functions.set(fn_name, `function __${fn_name}__(l:Lexer):boolean{${txt}}`);
        }
    }

    const code_node = new SC;


    code_node.addStatement(SC.Function(SC.Constant("set_error", "void")));

    return `
    ${runner.render_constants()}

${printLexer(symbols, keywords)}

function set_error(val: u32): void {
    error_array[error_ptr++ & 0xFF] = val;
}

function set_action(val: u32):void{
    action_array[action_ptr++] = val;
}

function completeProduction(body: u32, len: u32, production: u32): void {
    add_reduce(len, body);
    prod = production;
}

function completeProductionPlain(len: u32, production: u32): void {
    prod = production;
}

@inline
function mark (): u32{
    mark_ = action_ptr;
    return mark_;
}

@inline
function reset(mark:u32): void{
    action_ptr = mark;
}

function add_shift(l:Lexer, char_len: u32): void {
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

function add_reduce(sym_len: u32, body: u32, DO_NOT_PUSH_TO_STACK:boolean = false): void {
    const val: u32 = ((0<<0) | ((DO_NOT_PUSH_TO_STACK ? 1 : 0) << 1 ) | ((sym_len & 0x3FFF) << 2) | (body << 16));
    set_action(val);
}

function fail(lex:Lexer):void { 
    prod = -1;
    soft_fail(lex)
}

function soft_fail(lex:Lexer):void { 
    FAILED = true;
    set_error(lex.off);
}

function setProduction(production: u32):void{
    prod = (-FAILED) +  (-FAILED+1) * production;
}   
function _pk(l: Lexer, skips: () => boolean): Lexer {
    l.next();
    _skip(l, skips);
    return l;
}            

function _skip(l: Lexer, skips: () => boolean):void{
    while(1){

        ${grammar?.functions.has("custom_skip") ? (() => {
            let str = grammar.functions.get("custom_skip").txt;
            return convertAssertionFunctionBodyToSkribble(str, grammar, runner, -1);
        })() : ""}
        
        if (!skips()) break;
        l.next();
    }
}

function _no_check_with_skip(lex: Lexer, skips: () => boolean):void {
    add_shift(lex, lex.tl);
    lex.next();
    _skip(lex, skips);
}

function _no_check(lex: Lexer):void {
    add_shift(lex, lex.tl);
    lex.next();
}

function _with_skip(lex: Lexer, skips: () => boolean, accept: boolean):void {

    if(FAILED) return;
    
    if (accept) 
        _no_check_with_skip(lex, skips);
     else {
        //TODO error recovery
        soft_fail(lex);
    }
}
        
function _(lex: Lexer, accept: boolean):void {

    if(FAILED) return;
    
    if (accept) 
        _no_check(lex);
     else {
        //TODO error recovery
        soft_fail(lex);
    }
}

var prob_index = 0;
//For Debugging
function probe(l: Lexer, id: u32 = 1): void {
    set_error(0xF000000F + (id << 16) + (prob_index << 4));
    set_error(l.ty);
    set_error(l.id);
    set_error(l.tl);
    set_error(l.off);
    set_error(prod);
    set_error(stack_ptr);
    set_error(FAILED);
    set_error(0xF000000F + (id << 16) + ((prob_index++) << 4));
}

${[...assert_functions.values()].join("\n")}

${fns.join("\n    ")}

function reset_counters_and_pointers(): void{
    prod = -1; 

    stack_ptr = 0;

    error_ptr = 0;

    action_ptr = 0;

    FAILED = false;
}

export default function main (input_string:string): boolean {

    str = input_string;

    const lex = new Lexer();

    lex.next();

    reset_counters_and_pointers();

    $${grammar[0].name}(lex);

    set_action(0);

    set_error(0);

    return FAILED || !lex.END;    
}`;
};