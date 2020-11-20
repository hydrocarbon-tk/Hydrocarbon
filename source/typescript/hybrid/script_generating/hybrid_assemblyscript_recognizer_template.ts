import { Grammar, SymbolType } from "../../types/grammar.js";
import { createAssertionFunctionBody } from "../../util/common.js";
import { CompilerRunner } from "../types/CompilerRunner";
import { RDProductionFunction } from "../types/RDProductionFunction";
import { LRState } from "../types/State";
import { printLexer } from "./hybrid_lexer_template.js";
import { getTokenSelectorStatements } from "./hybrid_token_selector_template.js";

export const renderAssemblyScriptRecognizer = (
    grammar: Grammar,
    runner: CompilerRunner,
    rd_functions: RDProductionFunction[],
    lr_states: LRState[]
) => {


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
                txt = createAssertionFunctionBody(val.txt, grammar);

            assert_functions.set(fn_name, `function __${fn_name}__(l:Lexer):boolean{${txt}}`);
        }
    }

    return `
const 
    action_array_offset = (191488 << 1),
    error_array_offset = action_array_offset + (1048576 << 2),
    TokenSpace: i32 = 1,
    TokenNumber: i32 = 2,
    TokenIdentifier: i32 = 3,
    TokenNewLine: i32 = 4,
    TokenSymbol: i32 = 5,
    TypeSymbol: i32 = 6,
    TokenKeyword: i32 = 7,
    id: u16 = 2, 
    num: u16 = 4;

var
    mark_: u32 = 0,
    action_ptr: u32 = 0,
    error_ptr: u32 = 0,
    stack_ptr: u32 = 0,
    str: string = "", 
    FAILED: boolean = false, 
    prod: i32 = -1;

${printLexer(symbols, keywords)}

function set_error(val: u32): void {
    store<u32>(((error_ptr++ & 0xFF) << 2) + error_array_offset, val);
}

function set_action(val: u32):void{
    store<u32>(((action_ptr++) << 2) + (action_array_offset), val);
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

function _pk(l: Lexer, /* eh, */ skips: StaticArray<u32>): Lexer {

    while(1){
        
        ${grammar?.functions.has("custom_skip") ? (() => {
            let str = grammar.functions.get("custom_skip").txt;
            return createAssertionFunctionBody(str, grammar, runner, -1);
        })() : ""}

        if (l.END || (!skips.includes(l.ty) && !skips.includes(l.rd)))
            break;

        l.next();
    }

    return lex;
}            

function _skip(l: Lexer, skips: StaticArray<u32>):void{
    while(1){

        ${grammar?.functions.has("custom_skip") ? (() => {
            let str = grammar.functions.get("custom_skip").txt;
            return createAssertionFunctionBody(str, grammar, runner, -1);
        })() : ""}

        if (l.END || (!skips.includes(l.ty) && !skips.includes(l.id)))
            break;

        l.next();
    }
}

function _no_check_with_skip(lex: Lexer, skips: StaticArray<u32>):void {
    add_shift(lex, lex.tl);
    lex.next();
    _skip(lex, skips);
}

function _no_check(lex: Lexer):void {
    add_shift(lex, lex.tl);
    lex.next();
}

function _with_skip(lex: Lexer, skips: StaticArray<u32>, sym: u32 = 0):void {

    if(FAILED) return;
    
    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check_with_skip(lex, skips);
    } else {
        //TODO error recovery
        soft_fail(lex);
    }
}
        
function _(lex: Lexer, sym: u32 = 0):void {

    if(FAILED) return;
    
    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check(lex);
    } else {
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
${runner.render_constants()}
${runner.render_statements()}
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