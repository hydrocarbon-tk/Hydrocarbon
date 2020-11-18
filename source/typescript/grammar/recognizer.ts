
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


class Lexer {

    ty:i32;
    id:i32;
    tl:i32;
    off:i32;


    constructor() {
        this.ty = 0; //Default "non-value" for types is 1<<18;
        this.id = 0;
        this.tl = 0;
        this.off = 0;
    }

    copy(destination: Lexer = new Lexer()) : Lexer {
        destination.off = this.off;
        destination.id = this.id;
        destination.ty = this.ty;
        destination.tl = this.tl;
        return destination;
    }

    sync(marker: Lexer) : void { marker.copy(this); }

    peek() : Lexer {

        var peeking_marker: Lexer = new Lexer();

        peeking_marker.copy(peeking_marker);

        peeking_marker.next();

        return peeking_marker;
    }
    
    next() : Lexer{

        var l: i32 = str.length,
            length: i32 = 1,
            off: i32 = this.off + this.tl,
            type: i32 = 0,
            base: i32 = off;

        this.ty = 0;
        this.id = 0;

        if (off >= l) {
            this.off = l;
            this.tl = 0;
            return this;
        }

        const code:i32 = str.codePointAt(off);

        switch (load<u16>(0 + (code << 1)) & 255) {
            default:
            case 0: //SYMBOL
                this.id = type = TypeSymbol;
                break;
            case 1: //IDENTIFIER
                while (1) {
                    while (++off < l && (((id | num) & (load<u16>(0 + (str.codePointAt(off) << 1)) >> 8))));
                    this.id = type = TokenIdentifier;
                    length = off - base;
                    break;
                } break;
            case 2: //SPACE SET
                this.id = type = TokenSpace;
                break;
            case 3: //CARRIAGE RETURN
                length = 2;
            //intentional
            case 4: //LINEFEED
                this.id = type = TokenNewLine;
                break;
            case 5: //NUMBER
                this.id = type = TokenNumber;
                //Check for binary, hexadecimal, and octal representation
                while (++off < l && (num & (load<u16>(0 + (str.codePointAt(off) << 1)) >> 8)));
                length = off - base;
                break;
        }
        if (type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base+0)
if(val == 83 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 89 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 77 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 66 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 76 ){
if(length <= 6){type = TokenKeyword; this.id =22; length = 6;}
}
}
}
}
}
}
else if(val == 80 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 69 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 67 ){
if(length <= 4){type = TokenKeyword; this.id =23; length = 4;}
}
}
}
}
else if(val == 73 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 71 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 78 ){
if(length <= 3){type = TokenKeyword; this.id =42; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 69 ){
if(length <= 6){type = TokenKeyword; this.id =24; length = 6;}
}
}
}
}
}
else if(val == 77 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 80 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 84 ){
if(length <= 6){type = TokenKeyword; this.id =30; length = 6;}
}
}
}
}
}
}
else if(val == 69 ){
if(length <= 1){type = TokenKeyword; this.id =72; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
if(length <= 3){type = TokenKeyword; this.id =41; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
if(length <= 5){type = TokenKeyword; this.id =25; length = 5;}
}
}
}
}
else if(val == 88 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =27; length = 3;}
}
else if(val == 67 ){
if(length <= 3){type = TokenKeyword; this.id =40; length = 3;}
}
}
}
else if(val == 78 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 65 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 77 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 69 ){
if(length <= 4){type = TokenKeyword; this.id =26; length = 4;}
}
}
}
}
else if(val == 65 ){
if(length <= 1){type = TokenKeyword; this.id =68; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
if(length <= 2){type = TokenKeyword; this.id =28; length = 2;}
}
}
else if(val == 97 ){
if(length <= 1){type = TokenKeyword; this.id =64; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
if(length <= 2){type = TokenKeyword; this.id =29; length = 2;}
const val: u32 = str.charCodeAt(base+2)
if(val == 115 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 116 ){
if(length <= 6){type = TokenKeyword; this.id =59; length = 6;}
}
}
}
}
}
}
else if(val == 70 ){
if(length <= 1){type = TokenKeyword; this.id =73; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 75 ){
if(length <= 4){type = TokenKeyword; this.id =38; length = 4;}
}
}
}
}
else if(val == 82 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =43; length = 3;}
}
}
else if(val == 69 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 68 ){
if(length <= 3){type = TokenKeyword; this.id =44; length = 3;}
}
}
}
else if(val == 101 ){
if(length <= 1){type = TokenKeyword; this.id =67; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 104 ){
if(length <= 3){type = TokenKeyword; this.id =48; length = 3;}
}
}
}
else if(val == 99 ){
if(length <= 1){type = TokenKeyword; this.id =51; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 116 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 114 ){
if(length <= 4){type = TokenKeyword; this.id =50; length = 4;}
}
}
}
}
else if(val == 114 ){
if(length <= 1){type = TokenKeyword; this.id =53; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 116 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 117 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 110 ){
if(length <= 6){type = TokenKeyword; this.id =52; length = 6;}
}
}
}
}
}
}
else if(val == 102 ){
if(length <= 1){type = TokenKeyword; this.id =55; length = 1;}
}
else if(val == 115 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 104 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 105 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 102 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 116 ){
if(length <= 5){type = TokenKeyword; this.id =60; length = 5;}
}
}
}
}
}
else if(val == 103 ){
if(length <= 1){type = TokenKeyword; this.id =61; length = 1;}
}
else if(val == 116 ){
if(length <= 1){type = TokenKeyword; this.id =62; length = 1;}
}
else if(val == 98 ){
if(length <= 1){type = TokenKeyword; this.id =65; length = 1;}
}
else if(val == 100 ){
if(length <= 1){type = TokenKeyword; this.id =66; length = 1;}
}
else if(val == 66 ){
if(length <= 1){type = TokenKeyword; this.id =69; length = 1;}
}
else if(val == 67 ){
if(length <= 1){type = TokenKeyword; this.id =70; length = 1;}
}
else if(val == 68 ){
if(length <= 1){type = TokenKeyword; this.id =71; length = 1;}
}
        }
        if (type == TypeSymbol || type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base+0)
if(val == 40 ){
type = TokenSymbol; this.id =37 /* ( */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 40 ){
type = TokenSymbol; this.id =10 /* (( */; length = 2;
}
else if(val == 42 ){
type = TokenSymbol; this.id =15 /* (* */; length = 2;
}
else if(val == 43 ){
type = TokenSymbol; this.id =16 /* (+ */; length = 2;
}
}
else if(val == 41 ){
type = TokenSymbol; this.id =39 /* ) */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 41 ){
type = TokenSymbol; this.id =11 /* )) */; length = 2;
}
}
else if(val == 60 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =12 /* <> */; length = 2;
}
}
else if(val == 43 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =13 /* +> */; length = 2;
}
}
else if(val == 61 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =14 /* => */; length = 2;
}
}
else if(val == 58 ){
type = TokenSymbol; this.id =49 /* : */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 58 ){
type = TokenSymbol; this.id =17 /* :: */; length = 2;
}
}
else if(val == 964 ){
type = TokenSymbol; this.id =18 /* τ */; length = 1;
}
else if(val == 952 ){
type = TokenSymbol; this.id =19 /* θ */; length = 1;
}
else if(val == 603 ){
type = TokenSymbol; this.id =20 /* ɛ */; length = 1;
}
else if(val == 64 ){
type = TokenSymbol; this.id =21 /* @ */; length = 1;
}
else if(val == 9474 ){
type = TokenSymbol; this.id =31 /* │ */; length = 1;
}
else if(val == 124 ){
type = TokenSymbol; this.id =32 /* | */; length = 1;
}
else if(val == 8594 ){
type = TokenSymbol; this.id =33 /* → */; length = 1;
}
else if(val == 62 ){
type = TokenSymbol; this.id =34 /* > */; length = 1;
}
else if(val == 91 ){
type = TokenSymbol; this.id =35 /* [ */; length = 1;
}
else if(val == 93 ){
type = TokenSymbol; this.id =36 /* ] */; length = 1;
}
else if(val == 94 ){
type = TokenSymbol; this.id =45 /* ^ */; length = 1;
}
else if(val == 123 ){
type = TokenSymbol; this.id =46 /* { */; length = 1;
}
else if(val == 125 ){
type = TokenSymbol; this.id =47 /* } */; length = 1;
}
else if(val == 8614 ){
type = TokenSymbol; this.id =54 /* ↦ */; length = 1;
}
else if(val == 35 ){
type = TokenSymbol; this.id =56 /* # */; length = 1;
}
else if(val == 63 ){
type = TokenSymbol; this.id =57 /* ? */; length = 1;
}
else if(val == 36 ){
type = TokenSymbol; this.id =79 /* $ */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 111 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 102 ){
type = TokenSymbol; this.id =58 /* $eof */; length = 4;
}
}
}
}
else if(val == 92 ){
type = TokenSymbol; this.id =63 /* \ */; length = 1;
}
else if(val == 34 ){
type = TokenSymbol; this.id =74 /* " */; length = 1;
}
else if(val == 39 ){
type = TokenSymbol; this.id =75 /* ' */; length = 1;
}
else if(val == 47 ){
type = TokenSymbol; this.id =76 /* / */; length = 1;
}
else if(val == 45 ){
type = TokenSymbol; this.id =77 /* - */; length = 1;
}
else if(val == 95 ){
type = TokenSymbol; this.id =78 /* _ */; length = 1;
}
        }

        this.ty = type;
        this.off = base;
        this.tl = length;

        return this;
    }
    get END() : boolean { return this.off >= str.length; }
}

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

@inline
function add_skip(char_len: u32): void {
    const ACTION: u32 = 3;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function add_shift(char_len: u32): void {
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function add_reduce(sym_len: u32, body: u32): void {
    const ACTION: u32 = 1;
    const val: u32 = ACTION | ((sym_len & 0x3FFF) << 2) | (body << 16);
    set_action(val);
}

@inline
function lm(lex:Lexer, syms: StaticArray<u32>): boolean { 

    const l = syms.length;

    for(let i = 0; i < l; i++){
        const sym = syms[i];
        if(lex.id == sym || lex.ty == sym) return true;
    }

    return false;
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

function _pk(lex: Lexer, /* eh, */ skips: StaticArray<u32>): Lexer {

    lex.next();

    if (skips) while (lm(lex, skips)) lex.next();

    return lex;
}            

function _skip(lex: Lexer, skips: StaticArray<u32>):void{
    const off: u32 = lex.off;
    while (lm(lex, skips)) lex.next();
    const diff: i32 = lex.off-off;
    if(diff > 0) add_skip(diff);
}

function _no_check_with_skip(lex: Lexer, skips: StaticArray<u32>):void {
    add_shift(lex.tl);
    lex.next();
    _skip(lex, skips);
}

function _no_check(lex: Lexer):void {
    add_shift(lex.tl);
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


const const__ = StaticArray.fromArray<u32>([1,4]),
const_0_ = StaticArray.fromArray<u32>([1]),
const_1_ = StaticArray.fromArray<u32>([4]),
const_2_ = StaticArray.fromArray<u32>([18,19,35,37,54,55,59,60,61,62,63,78,79]),
const_3_ = StaticArray.fromArray<u32>([17,18,19,20,35,37,40,41,42,43,44,46,49,54,55,58,59,60,61,62,63,78,79]),
const_4_ = StaticArray.fromArray<u32>([18,19,20,35,54,55,58,59,60,61,62,63,78,79]),
_2id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,3); stack_ptr-=1;
             
            },
_141id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,3); stack_ptr-=2;
             
            },
_48id0 = (l:Lexer):void => { 
             
            $prd$production(l); stack_ptr++;
             
            },
_48id2 = (l:Lexer):void => { 
             
            $fn$referenced_function(l); stack_ptr++;
             
            },
_48id4 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State52(l);
             
            },
_51id2 = (l:Lexer):void => { 
             
            $cm$comment(l); stack_ptr++;
             
            },
_404id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State53(l);
             
            },
_404id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State54(l);
             
            },
_294id0 = (l:Lexer):void => { 
             
            $pb$production_bodies(l); stack_ptr++;
             
            },
_354id0 = (l:Lexer):void => { 
             
            $pb$production_bodies_group_04_100(l); stack_ptr++;
             
            },
_360id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_111_102(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$production_bodies_group_04_100(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_304id0 = (l:Lexer):void => { 
             
            completeProduction(27,2,28); stack_ptr-=2;
             
            },
_303id0 = (l:Lexer):void => { 
             
            $pb$production_body(l); stack_ptr++;
             
            },
_363id0 = (l:Lexer):void => { 
             
            completeProduction(26,3,28); stack_ptr-=3;
             
            },
_235id0 = (l:Lexer):void => { 
             
            completeProduction(25,1,28); stack_ptr-=1;
             
            },
_117id0 = (l:Lexer):void => { 
             
            $fn$js_primitive(l); stack_ptr++;
             
            },
_117id8 = (l:Lexer):void => { 
             
            $fn$js_data_block(l); stack_ptr++;
             
            },
_117id9 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State121(l);
             
            },
_121id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,39); stack_ptr-=1;
             
            },
_259id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,39); stack_ptr-=2;
             
            },
_92id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,54); stack_ptr-=1;
             
            },
_228id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,54); stack_ptr-=2;
             
            },
_32id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,5); stack_ptr-=1;
             
            },
_183id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,5); stack_ptr-=2;
             
            },
_59ty0 = (l:Lexer):void => { 
             
            completeProduction(27,1,47); stack_ptr-=1;
             
            },
_211ty0 = (l:Lexer):void => { 
             
            completeProduction(12,2,47); stack_ptr-=2;
             
            },
_333id0 = (l:Lexer):void => { 
             
            $sym$symbol(l); stack_ptr++;
             
            },
_333id9 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$condition_clause(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_333id10 = (l:Lexer):void => { 
             
            $fn$function_clause(l); stack_ptr++;
             
            },
_333id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State246(l);
             
            },
_246id0 = (l:Lexer):void => { 
             
            $pb$body_entries(l); stack_ptr++;
             
            },
_243id0 = (l:Lexer):void => { 
             
            $sym$symbol_group_032_105(l); stack_ptr++;
             
            },
_243id2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State308(l);
             
            },
const_5_ = (l:Lexer):void => { 
             
            completeProduction(34,1,31); stack_ptr-=1;
             
            },
_334id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $pb$condition_clause(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_337id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State372(l);
             
            },
_308id0 = (l:Lexer):void => { 
             
            completeProduction(56,2,63); stack_ptr-=2;
             
            },
_309id0 = (l:Lexer):void => { 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            },
_309id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State346(l);
             
            },
const_6_ = StaticArray.fromArray<u32>([12,13,15,16,31,32,36,37,54,55,56,57,78,79]),
_331id0 = (l:Lexer):void => { 
             
            completeProduction(35,2,31); stack_ptr-=2;
             
            },
_372id0 = (l:Lexer):void => { 
             
            completeProduction(36,3,31); stack_ptr-=3;
             
            },
_346id0 = (l:Lexer):void => { 
             
            completeProduction(57,3,63); stack_ptr-=3;
             
            },
_370id0 = (l:Lexer):void => { 
             
            completeProduction(57,4,63); stack_ptr-=4;
             
            },
_225id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State203(l);
             
            },
_225id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State204(l);
             
            },
_225ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State205(l);
             
            },
_225ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State165(l);
             
            },
_203id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,100); stack_ptr-=1;
             
            },
_299id0 = (l:Lexer):void => { 
             
            $sym$generated_symbol(l); stack_ptr++;
             
            },
_299id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$imported_production_symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$production_symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_299id4 = (l:Lexer):void => { 
             
            $sym$literal_symbol(l); stack_ptr++;
             
            },
_299id6 = (l:Lexer):void => { 
             
            $sym$escaped_symbol(l); stack_ptr++;
             
            },
_299id7 = (l:Lexer):void => { 
             
            $sym$assert_function_symbol(l); stack_ptr++;
             
            },
_299id9 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State300(l);
             
            },
_299ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State253(l);
             
            },
_299ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State254(l);
             
            },
const_7_ = StaticArray.fromArray<u32>([12,13,18,19,31,32,36,37,39,54,55,56,59,60,61,62,63,78,79]),
_253id0 = (l:Lexer):void => { 
             
            completeProduction(54,1,63); stack_ptr-=1;
             
            },
_249id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            },
_240id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $fn$reduce_function(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $fn$function_clause(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
const_8_ = (l:Lexer):void => { 
             
            completeProduction(33,1,30); stack_ptr-=1;
             
            },
_238id0 = (l:Lexer):void => { 
             
            completeProduction(29,1,29); stack_ptr-=1;
             
            },
_339id3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State365(l);
             
            },
_328id0 = (l:Lexer):void => { 
             
            completeProduction(30,2,30); stack_ptr-=2;
             
            },
_365id0 = (l:Lexer):void => { 
             
            completeProduction(55,3,63); stack_ptr-=3;
             
            },
_97id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,50); stack_ptr-=1;
             
            },
_229id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,50); stack_ptr-=2;
             
            };
const idm2r: Map<number, (L:Lexer)=>void> = new Map()
idm2r.set(12,_2id0)
idm2r.set(13,_2id0)
idm2r.set(54,_2id0)
idm2r.set(55,_2id0)
idm2r.set(20,_2id0)
idm2r.set(21,_2id0)
idm2r.set(56,_2id0);
const tym2r: Map<number, (L:Lexer)=>void> = new Map()
tym2r.set(0,_2id0);
const idm141r: Map<number, (L:Lexer)=>void> = new Map()
idm141r.set(12,_141id0)
idm141r.set(13,_141id0)
idm141r.set(54,_141id0)
idm141r.set(55,_141id0)
idm141r.set(20,_141id0)
idm141r.set(21,_141id0)
idm141r.set(56,_141id0);
const tym141r: Map<number, (L:Lexer)=>void> = new Map()
tym141r.set(0,_141id0);
const idm48: Map<number, (L:Lexer)=>void> = new Map()
idm48.set(12,_48id0)
idm48.set(13,_48id0)
idm48.set(54,_48id2)
idm48.set(55,_48id2)
idm48.set(20,_48id4);
const idm51: Map<number, (L:Lexer)=>void> = new Map()
idm51.set(12,_48id0)
idm51.set(13,_48id0)
idm51.set(56,_51id2)
idm51.set(54,_48id2)
idm51.set(55,_48id2);
const idm404: Map<number, (L:Lexer)=>void> = new Map()
idm404.set(12,_404id0)
idm404.set(13,_404id1);
const idm294: Map<number, (L:Lexer)=>void> = new Map()
idm294.set(37,_294id0)
idm294.set(19,_294id0)
idm294.set(61,_294id0)
idm294.set(78,_294id0)
idm294.set(79,_294id0)
idm294.set(18,_294id0)
idm294.set(62,_294id0)
idm294.set(63,_294id0)
idm294.set(59,_294id0)
idm294.set(60,_294id0)
idm294.set(54,_294id0)
idm294.set(55,_294id0)
idm294.set(35,_294id0)
idm294.set(20,_294id0)
idm294.set(58,_294id0);
const tym294: Map<number, (L:Lexer)=>void> = new Map()
tym294.set(3,_294id0)
tym294.set(7,_294id0)
tym294.set(6,_294id0)
tym294.set(5,_294id0);
const idm354: Map<number, (L:Lexer)=>void> = new Map()
idm354.set(31,_354id0)
idm354.set(32,_354id0)
idm354.set(56,_51id2);
const idm360: Map<number, (L:Lexer)=>void> = new Map()
idm360.set(31,_360id0)
idm360.set(32,_360id0)
idm360.set(56,_51id2);
const idm304r: Map<number, (L:Lexer)=>void> = new Map()
idm304r.set(31,_304id0)
idm304r.set(32,_304id0)
idm304r.set(56,_304id0)
idm304r.set(39,_304id0)
idm304r.set(12,_304id0)
idm304r.set(13,_304id0)
idm304r.set(54,_304id0)
idm304r.set(55,_304id0);
const tym304r: Map<number, (L:Lexer)=>void> = new Map()
tym304r.set(0,_304id0);
const idm303: Map<number, (L:Lexer)=>void> = new Map()
idm303.set(37,_303id0)
idm303.set(19,_303id0)
idm303.set(61,_303id0)
idm303.set(78,_303id0)
idm303.set(79,_303id0)
idm303.set(18,_303id0)
idm303.set(62,_303id0)
idm303.set(63,_303id0)
idm303.set(59,_303id0)
idm303.set(60,_303id0)
idm303.set(54,_303id0)
idm303.set(55,_303id0)
idm303.set(35,_303id0)
idm303.set(20,_303id0)
idm303.set(58,_303id0);
const tym303: Map<number, (L:Lexer)=>void> = new Map()
tym303.set(3,_303id0)
tym303.set(7,_303id0)
tym303.set(6,_303id0)
tym303.set(5,_303id0);
const idm363r: Map<number, (L:Lexer)=>void> = new Map()
idm363r.set(31,_363id0)
idm363r.set(32,_363id0)
idm363r.set(56,_363id0)
idm363r.set(39,_363id0)
idm363r.set(12,_363id0)
idm363r.set(13,_363id0)
idm363r.set(54,_363id0)
idm363r.set(55,_363id0);
const tym363r: Map<number, (L:Lexer)=>void> = new Map()
tym363r.set(0,_363id0);
const idm235r: Map<number, (L:Lexer)=>void> = new Map()
idm235r.set(31,_235id0)
idm235r.set(32,_235id0)
idm235r.set(56,_235id0)
idm235r.set(39,_235id0)
idm235r.set(12,_235id0)
idm235r.set(13,_235id0)
idm235r.set(54,_235id0)
idm235r.set(55,_235id0);
const tym235r: Map<number, (L:Lexer)=>void> = new Map()
tym235r.set(0,_235id0);
const idm117: Map<number, (L:Lexer)=>void> = new Map()
idm117.set(19,_117id0)
idm117.set(61,_117id0)
idm117.set(18,_117id0)
idm117.set(62,_117id0)
idm117.set(63,_117id0)
idm117.set(59,_117id0)
idm117.set(60,_117id0)
idm117.set(58,_117id0)
idm117.set(46,_117id8)
idm117.set(20,_117id9);
const tym117: Map<number, (L:Lexer)=>void> = new Map()
tym117.set(3,_117id0)
tym117.set(2,_117id0)
tym117.set(1,_117id0)
tym117.set(6,_117id0)
tym117.set(5,_117id0)
tym117.set(7,_117id0);
const idm121r: Map<number, (L:Lexer)=>void> = new Map()
idm121r.set(47,_121id0)
idm121r.set(19,_121id0)
idm121r.set(61,_121id0)
idm121r.set(18,_121id0)
idm121r.set(62,_121id0)
idm121r.set(63,_121id0)
idm121r.set(59,_121id0)
idm121r.set(60,_121id0)
idm121r.set(58,_121id0)
idm121r.set(46,_121id0);
const tym121r: Map<number, (L:Lexer)=>void> = new Map()
tym121r.set(3,_121id0)
tym121r.set(2,_121id0)
tym121r.set(1,_121id0)
tym121r.set(6,_121id0)
tym121r.set(5,_121id0)
tym121r.set(7,_121id0)
tym121r.set(88,_121id0);
const idm120: Map<number, (L:Lexer)=>void> = new Map()
idm120.set(19,_117id0)
idm120.set(61,_117id0)
idm120.set(18,_117id0)
idm120.set(62,_117id0)
idm120.set(63,_117id0)
idm120.set(59,_117id0)
idm120.set(60,_117id0)
idm120.set(58,_117id0)
idm120.set(46,_117id8);
const idm259r: Map<number, (L:Lexer)=>void> = new Map()
idm259r.set(47,_259id0)
idm259r.set(19,_259id0)
idm259r.set(61,_259id0)
idm259r.set(18,_259id0)
idm259r.set(62,_259id0)
idm259r.set(63,_259id0)
idm259r.set(59,_259id0)
idm259r.set(60,_259id0)
idm259r.set(58,_259id0)
idm259r.set(46,_259id0);
const tym259r: Map<number, (L:Lexer)=>void> = new Map()
tym259r.set(3,_259id0)
tym259r.set(2,_259id0)
tym259r.set(1,_259id0)
tym259r.set(6,_259id0)
tym259r.set(5,_259id0)
tym259r.set(7,_259id0)
tym259r.set(88,_259id0);
const idm92r: Map<number, (L:Lexer)=>void> = new Map()
idm92r.set(19,_92id0)
idm92r.set(61,_92id0)
idm92r.set(18,_92id0)
idm92r.set(62,_92id0)
idm92r.set(63,_92id0);
const tym92r: Map<number, (L:Lexer)=>void> = new Map()
tym92r.set(4,_92id0)
tym92r.set(88,_92id0)
tym92r.set(0,_92id0);
const idm228r: Map<number, (L:Lexer)=>void> = new Map()
idm228r.set(19,_228id0)
idm228r.set(61,_228id0)
idm228r.set(18,_228id0)
idm228r.set(62,_228id0)
idm228r.set(63,_228id0);
const tym228r: Map<number, (L:Lexer)=>void> = new Map()
tym228r.set(4,_228id0)
tym228r.set(88,_228id0)
tym228r.set(0,_228id0);
const idm32r: Map<number, (L:Lexer)=>void> = new Map()
idm32r.set(19,_32id0)
idm32r.set(61,_32id0)
idm32r.set(18,_32id0)
idm32r.set(62,_32id0)
idm32r.set(63,_32id0);
const tym32r: Map<number, (L:Lexer)=>void> = new Map()
tym32r.set(6,_32id0)
tym32r.set(3,_32id0)
tym32r.set(88,_32id0)
tym32r.set(4,_32id0)
tym32r.set(0,_32id0);
const idm183r: Map<number, (L:Lexer)=>void> = new Map()
idm183r.set(19,_183id0)
idm183r.set(61,_183id0)
idm183r.set(18,_183id0)
idm183r.set(62,_183id0)
idm183r.set(63,_183id0);
const tym183r: Map<number, (L:Lexer)=>void> = new Map()
tym183r.set(6,_183id0)
tym183r.set(3,_183id0)
tym183r.set(88,_183id0)
tym183r.set(4,_183id0)
tym183r.set(0,_183id0);
const tym59r: Map<number, (L:Lexer)=>void> = new Map()
tym59r.set(4,_59ty0)
tym59r.set(6,_59ty0)
tym59r.set(5,_59ty0)
tym59r.set(3,_59ty0)
tym59r.set(2,_59ty0)
tym59r.set(1,_59ty0)
tym59r.set(7,_59ty0)
tym59r.set(0,_59ty0);
const tym211r: Map<number, (L:Lexer)=>void> = new Map()
tym211r.set(4,_211ty0)
tym211r.set(6,_211ty0)
tym211r.set(5,_211ty0)
tym211r.set(3,_211ty0)
tym211r.set(2,_211ty0)
tym211r.set(1,_211ty0)
tym211r.set(7,_211ty0)
tym211r.set(0,_211ty0);
const idm333: Map<number, (L:Lexer)=>void> = new Map()
idm333.set(19,_333id0)
idm333.set(61,_333id0)
idm333.set(78,_333id0)
idm333.set(79,_333id0)
idm333.set(18,_333id0)
idm333.set(62,_333id0)
idm333.set(63,_333id0)
idm333.set(59,_333id0)
idm333.set(60,_333id0)
idm333.set(37,_333id9)
idm333.set(54,_333id10)
idm333.set(55,_333id10)
idm333.set(35,_333id12);
const tym333: Map<number, (L:Lexer)=>void> = new Map()
tym333.set(3,_333id0)
tym333.set(7,_333id0)
tym333.set(6,_333id0)
tym333.set(5,_333id0);
const idm246: Map<number, (L:Lexer)=>void> = new Map()
idm246.set(19,_246id0)
idm246.set(61,_246id0)
idm246.set(78,_246id0)
idm246.set(79,_246id0)
idm246.set(18,_246id0)
idm246.set(62,_246id0)
idm246.set(63,_246id0)
idm246.set(59,_246id0)
idm246.set(60,_246id0)
idm246.set(37,_246id0)
idm246.set(54,_246id0)
idm246.set(55,_246id0)
idm246.set(35,_246id0);
const tym246: Map<number, (L:Lexer)=>void> = new Map()
tym246.set(3,_246id0)
tym246.set(7,_246id0)
tym246.set(6,_246id0)
tym246.set(5,_246id0);
const idm243: Map<number, (L:Lexer)=>void> = new Map()
idm243.set(16,_243id0)
idm243.set(15,_243id0)
idm243.set(57,_243id2);
const idm243r: Map<number, (L:Lexer)=>void> = new Map()
idm243r.set(54,const_5_)
idm243r.set(55,const_5_)
idm243r.set(37,const_5_)
idm243r.set(19,const_5_)
idm243r.set(61,const_5_)
idm243r.set(78,const_5_)
idm243r.set(79,const_5_)
idm243r.set(18,const_5_)
idm243r.set(62,const_5_)
idm243r.set(63,const_5_)
idm243r.set(59,const_5_)
idm243r.set(60,const_5_)
idm243r.set(31,const_5_)
idm243r.set(32,const_5_)
idm243r.set(56,const_5_)
idm243r.set(39,const_5_)
idm243r.set(12,const_5_)
idm243r.set(13,const_5_)
idm243r.set(36,const_5_);
const tym243r: Map<number, (L:Lexer)=>void> = new Map()
tym243r.set(3,const_5_)
tym243r.set(7,const_5_)
tym243r.set(6,const_5_)
tym243r.set(5,const_5_)
tym243r.set(0,const_5_);
const idm334: Map<number, (L:Lexer)=>void> = new Map()
idm334.set(54,_333id10)
idm334.set(55,_333id10)
idm334.set(37,_334id2)
idm334.set(19,_333id0)
idm334.set(61,_333id0)
idm334.set(78,_333id0)
idm334.set(79,_333id0)
idm334.set(18,_333id0)
idm334.set(62,_333id0)
idm334.set(63,_333id0)
idm334.set(59,_333id0)
idm334.set(60,_333id0);
const idm337: Map<number, (L:Lexer)=>void> = new Map()
idm337.set(54,_333id10)
idm337.set(55,_333id10)
idm337.set(37,_334id2)
idm337.set(19,_333id0)
idm337.set(61,_333id0)
idm337.set(78,_333id0)
idm337.set(79,_333id0)
idm337.set(18,_333id0)
idm337.set(62,_333id0)
idm337.set(63,_333id0)
idm337.set(59,_333id0)
idm337.set(60,_333id0)
idm337.set(36,_337id12);
const idm308r: Map<number, (L:Lexer)=>void> = new Map()
idm308r.set(54,_308id0)
idm308r.set(57,_308id0)
idm308r.set(16,_308id0)
idm308r.set(15,_308id0)
idm308r.set(55,_308id0)
idm308r.set(37,_308id0)
idm308r.set(19,_308id0)
idm308r.set(61,_308id0)
idm308r.set(78,_308id0)
idm308r.set(79,_308id0)
idm308r.set(18,_308id0)
idm308r.set(62,_308id0)
idm308r.set(63,_308id0)
idm308r.set(59,_308id0)
idm308r.set(60,_308id0)
idm308r.set(31,_308id0)
idm308r.set(32,_308id0)
idm308r.set(56,_308id0)
idm308r.set(39,_308id0)
idm308r.set(12,_308id0)
idm308r.set(13,_308id0)
idm308r.set(36,_308id0);
const tym308r: Map<number, (L:Lexer)=>void> = new Map()
tym308r.set(3,_308id0)
tym308r.set(7,_308id0)
tym308r.set(6,_308id0)
tym308r.set(5,_308id0)
tym308r.set(0,_308id0);
const idm309: Map<number, (L:Lexer)=>void> = new Map()
idm309.set(19,_309id0)
idm309.set(61,_309id0)
idm309.set(18,_309id0)
idm309.set(62,_309id0)
idm309.set(63,_309id0)
idm309.set(59,_309id0)
idm309.set(60,_309id0)
idm309.set(39,_309id7);
const idm331r: Map<number, (L:Lexer)=>void> = new Map()
idm331r.set(54,_331id0)
idm331r.set(55,_331id0)
idm331r.set(37,_331id0)
idm331r.set(19,_331id0)
idm331r.set(61,_331id0)
idm331r.set(78,_331id0)
idm331r.set(79,_331id0)
idm331r.set(18,_331id0)
idm331r.set(62,_331id0)
idm331r.set(63,_331id0)
idm331r.set(59,_331id0)
idm331r.set(60,_331id0)
idm331r.set(31,_331id0)
idm331r.set(32,_331id0)
idm331r.set(56,_331id0)
idm331r.set(39,_331id0)
idm331r.set(12,_331id0)
idm331r.set(13,_331id0)
idm331r.set(36,_331id0);
const tym331r: Map<number, (L:Lexer)=>void> = new Map()
tym331r.set(3,_331id0)
tym331r.set(7,_331id0)
tym331r.set(6,_331id0)
tym331r.set(5,_331id0)
tym331r.set(0,_331id0);
const idm372r: Map<number, (L:Lexer)=>void> = new Map()
idm372r.set(54,_372id0)
idm372r.set(55,_372id0)
idm372r.set(37,_372id0)
idm372r.set(19,_372id0)
idm372r.set(61,_372id0)
idm372r.set(78,_372id0)
idm372r.set(79,_372id0)
idm372r.set(18,_372id0)
idm372r.set(62,_372id0)
idm372r.set(63,_372id0)
idm372r.set(59,_372id0)
idm372r.set(60,_372id0)
idm372r.set(31,_372id0)
idm372r.set(32,_372id0)
idm372r.set(56,_372id0)
idm372r.set(39,_372id0)
idm372r.set(12,_372id0)
idm372r.set(13,_372id0)
idm372r.set(36,_372id0);
const tym372r: Map<number, (L:Lexer)=>void> = new Map()
tym372r.set(3,_372id0)
tym372r.set(7,_372id0)
tym372r.set(6,_372id0)
tym372r.set(5,_372id0)
tym372r.set(0,_372id0);
const idm346r: Map<number, (L:Lexer)=>void> = new Map()
idm346r.set(54,_346id0)
idm346r.set(57,_346id0)
idm346r.set(16,_346id0)
idm346r.set(15,_346id0)
idm346r.set(55,_346id0)
idm346r.set(37,_346id0)
idm346r.set(19,_346id0)
idm346r.set(61,_346id0)
idm346r.set(78,_346id0)
idm346r.set(79,_346id0)
idm346r.set(18,_346id0)
idm346r.set(62,_346id0)
idm346r.set(63,_346id0)
idm346r.set(59,_346id0)
idm346r.set(60,_346id0)
idm346r.set(31,_346id0)
idm346r.set(32,_346id0)
idm346r.set(56,_346id0)
idm346r.set(39,_346id0)
idm346r.set(12,_346id0)
idm346r.set(13,_346id0)
idm346r.set(36,_346id0);
const tym346r: Map<number, (L:Lexer)=>void> = new Map()
tym346r.set(3,_346id0)
tym346r.set(7,_346id0)
tym346r.set(6,_346id0)
tym346r.set(5,_346id0)
tym346r.set(0,_346id0);
const idm370r: Map<number, (L:Lexer)=>void> = new Map()
idm370r.set(54,_370id0)
idm370r.set(57,_370id0)
idm370r.set(16,_370id0)
idm370r.set(15,_370id0)
idm370r.set(55,_370id0)
idm370r.set(37,_370id0)
idm370r.set(19,_370id0)
idm370r.set(61,_370id0)
idm370r.set(78,_370id0)
idm370r.set(79,_370id0)
idm370r.set(18,_370id0)
idm370r.set(62,_370id0)
idm370r.set(63,_370id0)
idm370r.set(59,_370id0)
idm370r.set(60,_370id0)
idm370r.set(31,_370id0)
idm370r.set(32,_370id0)
idm370r.set(56,_370id0)
idm370r.set(39,_370id0)
idm370r.set(12,_370id0)
idm370r.set(13,_370id0)
idm370r.set(36,_370id0);
const tym370r: Map<number, (L:Lexer)=>void> = new Map()
tym370r.set(3,_370id0)
tym370r.set(7,_370id0)
tym370r.set(6,_370id0)
tym370r.set(5,_370id0)
tym370r.set(0,_370id0);
const idm225: Map<number, (L:Lexer)=>void> = new Map()
idm225.set(78,_225id0)
idm225.set(79,_225id1);
const tym225: Map<number, (L:Lexer)=>void> = new Map()
tym225.set(3,_225ty0)
tym225.set(7,_225ty1);
const idm203r: Map<number, (L:Lexer)=>void> = new Map()
idm203r.set(19,_203id0)
idm203r.set(78,_203id0)
idm203r.set(79,_203id0)
idm203r.set(61,_203id0)
idm203r.set(18,_203id0)
idm203r.set(62,_203id0)
idm203r.set(63,_203id0)
idm203r.set(45,_203id0)
idm203r.set(46,_203id0)
idm203r.set(33,_203id0)
idm203r.set(34,_203id0)
idm203r.set(17,_203id0)
idm203r.set(59,_203id0)
idm203r.set(60,_203id0)
idm203r.set(39,_203id0)
idm203r.set(57,_203id0)
idm203r.set(16,_203id0)
idm203r.set(15,_203id0)
idm203r.set(54,_203id0)
idm203r.set(55,_203id0)
idm203r.set(37,_203id0)
idm203r.set(36,_203id0)
idm203r.set(31,_203id0)
idm203r.set(32,_203id0)
idm203r.set(56,_203id0)
idm203r.set(12,_203id0)
idm203r.set(13,_203id0)
idm203r.set(47,_203id0);
const tym203r: Map<number, (L:Lexer)=>void> = new Map()
tym203r.set(3,_203id0)
tym203r.set(7,_203id0)
tym203r.set(2,_203id0)
tym203r.set(6,_203id0)
tym203r.set(6,_203id0)
tym203r.set(6,_203id0)
tym203r.set(6,_203id0)
tym203r.set(88,_203id0)
tym203r.set(4,_203id0)
tym203r.set(0,_203id0)
tym203r.set(5,_203id0)
tym203r.set(6,_203id0)
tym203r.set(6,_203id0)
tym203r.set(1,_203id0);
const idm299: Map<number, (L:Lexer)=>void> = new Map()
idm299.set(19,_299id0)
idm299.set(61,_299id0)
idm299.set(78,_299id2)
idm299.set(79,_299id2)
idm299.set(18,_299id4)
idm299.set(62,_299id4)
idm299.set(63,_299id6)
idm299.set(59,_299id7)
idm299.set(60,_299id7)
idm299.set(37,_299id9);
const tym299: Map<number, (L:Lexer)=>void> = new Map()
tym299.set(3,_299id2)
tym299.set(7,_299id2)
tym299.set(6,_299ty2)
tym299.set(5,_299ty3);
const idm253r: Map<number, (L:Lexer)=>void> = new Map()
idm253r.set(54,_253id0)
idm253r.set(57,_253id0)
idm253r.set(16,_253id0)
idm253r.set(15,_253id0)
idm253r.set(55,_253id0)
idm253r.set(37,_253id0)
idm253r.set(19,_253id0)
idm253r.set(61,_253id0)
idm253r.set(78,_253id0)
idm253r.set(79,_253id0)
idm253r.set(18,_253id0)
idm253r.set(62,_253id0)
idm253r.set(63,_253id0)
idm253r.set(59,_253id0)
idm253r.set(60,_253id0)
idm253r.set(31,_253id0)
idm253r.set(32,_253id0)
idm253r.set(56,_253id0)
idm253r.set(39,_253id0)
idm253r.set(12,_253id0)
idm253r.set(13,_253id0)
idm253r.set(36,_253id0);
const tym253r: Map<number, (L:Lexer)=>void> = new Map()
tym253r.set(3,_253id0)
tym253r.set(7,_253id0)
tym253r.set(6,_253id0)
tym253r.set(5,_253id0)
tym253r.set(0,_253id0);
const idm249r: Map<number, (L:Lexer)=>void> = new Map()
idm249r.set(54,_249id0)
idm249r.set(57,_249id0)
idm249r.set(16,_249id0)
idm249r.set(15,_249id0)
idm249r.set(55,_249id0)
idm249r.set(37,_249id0)
idm249r.set(19,_249id0)
idm249r.set(61,_249id0)
idm249r.set(78,_249id0)
idm249r.set(79,_249id0)
idm249r.set(18,_249id0)
idm249r.set(62,_249id0)
idm249r.set(63,_249id0)
idm249r.set(59,_249id0)
idm249r.set(60,_249id0)
idm249r.set(31,_249id0)
idm249r.set(32,_249id0)
idm249r.set(56,_249id0)
idm249r.set(39,_249id0)
idm249r.set(12,_249id0)
idm249r.set(13,_249id0)
idm249r.set(36,_249id0);
const tym249r: Map<number, (L:Lexer)=>void> = new Map()
tym249r.set(3,_249id0)
tym249r.set(7,_249id0)
tym249r.set(6,_249id0)
tym249r.set(5,_249id0)
tym249r.set(0,_249id0);
const idm240: Map<number, (L:Lexer)=>void> = new Map()
idm240.set(54,_240id0)
idm240.set(55,_240id0)
idm240.set(37,_334id2)
idm240.set(19,_333id0)
idm240.set(61,_333id0)
idm240.set(78,_333id0)
idm240.set(79,_333id0)
idm240.set(18,_333id0)
idm240.set(62,_333id0)
idm240.set(63,_333id0)
idm240.set(59,_333id0)
idm240.set(60,_333id0);
const idm240r: Map<number, (L:Lexer)=>void> = new Map()
idm240r.set(54,const_8_)
idm240r.set(55,const_8_)
idm240r.set(31,const_8_)
idm240r.set(32,const_8_)
idm240r.set(56,const_8_)
idm240r.set(39,const_8_)
idm240r.set(12,const_8_)
idm240r.set(13,const_8_);
const tym240r: Map<number, (L:Lexer)=>void> = new Map()
tym240r.set(0,const_8_);
const idm238r: Map<number, (L:Lexer)=>void> = new Map()
idm238r.set(31,_238id0)
idm238r.set(32,_238id0)
idm238r.set(56,_238id0)
idm238r.set(39,_238id0)
idm238r.set(12,_238id0)
idm238r.set(13,_238id0)
idm238r.set(54,_238id0)
idm238r.set(55,_238id0);
const tym238r: Map<number, (L:Lexer)=>void> = new Map()
tym238r.set(0,_238id0);
const idm339: Map<number, (L:Lexer)=>void> = new Map()
idm339.set(31,_354id0)
idm339.set(32,_354id0)
idm339.set(56,_51id2)
idm339.set(39,_339id3);
const idm328r: Map<number, (L:Lexer)=>void> = new Map()
idm328r.set(31,_328id0)
idm328r.set(32,_328id0)
idm328r.set(56,_328id0)
idm328r.set(39,_328id0)
idm328r.set(12,_328id0)
idm328r.set(13,_328id0)
idm328r.set(54,_328id0)
idm328r.set(55,_328id0);
const tym328r: Map<number, (L:Lexer)=>void> = new Map()
tym328r.set(0,_328id0);
const idm365r: Map<number, (L:Lexer)=>void> = new Map()
idm365r.set(54,_365id0)
idm365r.set(57,_365id0)
idm365r.set(16,_365id0)
idm365r.set(15,_365id0)
idm365r.set(55,_365id0)
idm365r.set(37,_365id0)
idm365r.set(19,_365id0)
idm365r.set(61,_365id0)
idm365r.set(78,_365id0)
idm365r.set(79,_365id0)
idm365r.set(18,_365id0)
idm365r.set(62,_365id0)
idm365r.set(63,_365id0)
idm365r.set(59,_365id0)
idm365r.set(60,_365id0)
idm365r.set(31,_365id0)
idm365r.set(32,_365id0)
idm365r.set(56,_365id0)
idm365r.set(39,_365id0)
idm365r.set(12,_365id0)
idm365r.set(13,_365id0)
idm365r.set(36,_365id0);
const tym365r: Map<number, (L:Lexer)=>void> = new Map()
tym365r.set(3,_365id0)
tym365r.set(7,_365id0)
tym365r.set(6,_365id0)
tym365r.set(5,_365id0)
tym365r.set(0,_365id0);
const idm97r: Map<number, (L:Lexer)=>void> = new Map()
idm97r.set(39,_97id0)
idm97r.set(19,_97id0)
idm97r.set(61,_97id0)
idm97r.set(18,_97id0)
idm97r.set(62,_97id0)
idm97r.set(63,_97id0)
idm97r.set(59,_97id0)
idm97r.set(60,_97id0);
const tym97r: Map<number, (L:Lexer)=>void> = new Map()
tym97r.set(88,_97id0)
tym97r.set(0,_97id0);
const idm229r: Map<number, (L:Lexer)=>void> = new Map()
idm229r.set(39,_229id0)
idm229r.set(19,_229id0)
idm229r.set(61,_229id0)
idm229r.set(18,_229id0)
idm229r.set(62,_229id0)
idm229r.set(63,_229id0)
idm229r.set(59,_229id0)
idm229r.set(60,_229id0);
const tym229r: Map<number, (L:Lexer)=>void> = new Map()
tym229r.set(88,_229id0)
tym229r.set(0,_229id0);
function $hydrocarbon(l:Lexer) :void{_skip(l, const__)
$head(l)
if(!FAILED){
setProduction(0)
add_reduce(1,1);
return;
}
fail(l);}
    function $head(l:Lexer) :void{_skip(l, const__)
if(l.id == 21||l.id == 56){
 $pre$preamble(l)
if(!FAILED){
$prd$productions(l)
if(!FAILED){
setProduction(1)
add_reduce(2,2);
return;
}
}
} else if(l.id == 12||l.id == 13||l.id == 20||l.id == 54||l.id == 55){
 $prd$productions(l)
if(!FAILED){
setProduction(1)
add_reduce(1,3);
return;
}
}
fail(l);}
    
    function $pre$preamble_clause(l:Lexer) :void{_skip(l, const__)
if(l.id == 21){
 const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
if(!FAILED &&  pk1.id == 24){
 $pre$ignore_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 22){
 $pre$symbols_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 23){
 $pre$precedence_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 26){
 $pre$name_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 27){
 $pre$ext_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 25){
 $pre$error_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 30){
 $pre$import_preamble(l)
if(!FAILED){
setProduction(4)

return;
}
}
} else if(l.id == 56){
 $cm$comment(l)
if(!FAILED){
setProduction(4)

return;
}
}
fail(l);}
    
    function $pre$symbols_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 22);
if(!FAILED){
$pre$symbols_preamble_HC_listbody2_101(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(6)
add_reduce(4,6);
return;
}
}
}
}
fail(l);}
    function $pre$precedence_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 23);
if(!FAILED){
$sym$terminal_symbol(l)
if(!FAILED){
_with_skip(l, const_0_, 2);
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(7)
add_reduce(5,7);
return;
}
}
}
}
}
fail(l);}
    function $pre$ignore_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 24);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(8)
add_reduce(4,8);
return;
}
}
}
}
fail(l);}
    function $pre$error_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 25);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(9)
add_reduce(4,9);
return;
}
}
}
}
fail(l);}
    function $pre$name_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 26);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(10)
add_reduce(4,10);
return;
}
}
}
}
fail(l);}
    function $pre$ext_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 21);
if(!FAILED){
_with_skip(l, const__, 27);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(11)
add_reduce(4,11);
return;
}
}
}
}
fail(l);}
    
    function $pre$import_preamble_group_019_103(l:Lexer) :void{_skip(l, const__)
if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(13)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(13)

return;
}
} else if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(13)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(13)

return;
}
}
fail(l);}
    
    
    function $pre$import_preamble_group_021_106(l:Lexer) :void{_skip(l, const__)
if(l.id == 28){
 _no_check(l);
if(!FAILED){
setProduction(16)

return;
}
} else if(l.id == 29){
 _no_check(l);
if(!FAILED){
setProduction(16)

return;
}
}
fail(l);}
    function $pre$import_preamble(l:Lexer) :void{_skip(l, const__)
_no_check(l);
_with_skip(l, const_1_, 30);
_skip(l, const_1_)
if(l.ty == 1){
 $pre$import_preamble_HC_listbody2_102(l)
if(!FAILED){
$pre$import_preamble_HC_listbody1_104(l)
if(!FAILED){
$pre$import_preamble_HC_listbody4_105(l)
if(!FAILED){
$pre$import_preamble_group_021_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(17)
add_reduce(8,14);
return;
}
}
}
}
}
}
} else if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $pre$import_preamble_HC_listbody1_104(l)
if(!FAILED){
$pre$import_preamble_HC_listbody4_105(l)
if(!FAILED){
$pre$import_preamble_group_021_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(17)
add_reduce(7,14);
return;
}
}
}
}
}
}
fail(l);}
    
    function $prd$production_group_08_100(l:Lexer) :void{_skip(l, const__)
$sym$production_id(l)
if(!FAILED){
setProduction(20)
add_reduce(1,19);
return;
}
fail(l);}
    function $prd$production_group_010_101(l:Lexer) :void{_skip(l, const__)
if(l.id == 31){
 _no_check(l);
if(!FAILED){
setProduction(21)

return;
}
} else if(l.id == 32){
 _no_check(l);
if(!FAILED){
setProduction(21)

return;
}
}
fail(l);}
    function $prd$production_group_111_102(l:Lexer) :void{_skip(l, const__)
$prd$production_group_010_101(l)
if(!FAILED){
$fn$error_function(l)
if(!FAILED){
setProduction(22)
add_reduce(2,0);
return;
}
}
fail(l);}
    function $prd$production_group_013_103(l:Lexer) :void{_skip(l, const__)
$sym$imported_production_symbol(l)
if(!FAILED){
setProduction(23)
add_reduce(1,20);
return;
}
fail(l);}
    
    function $prd$production_start_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 33){
 _no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.id == 34){
 _no_check(l);
if(!FAILED){
setProduction(25)

return;
}
}
fail(l);}
    function $pb$production_bodies_group_04_100(l:Lexer) :void{_skip(l, const__)
if(l.id == 31){
 _no_check(l);
if(!FAILED){
setProduction(27)

return;
}
} else if(l.id == 32){
 _no_check(l);
if(!FAILED){
setProduction(27)

return;
}
}
fail(l);}
    
    function $pb$production_body(l:Lexer) :void{_skip(l, const__)
if(l.id == 37){
 const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
if(!FAILED &&  pk1.id == 38){
 $pb$force_fork(l)
if(!FAILED){
$pb$entries(l)
if(!FAILED){
setProduction(29)
add_reduce(2,28);
return;
}
}
} else if(!FAILED &&  const_3_.includes(pk1.id)||pk1.ty == 2||pk1.ty == 3||pk1.ty == 5||pk1.ty == 6||pk1.ty == 7){
 $pb$entries(l)
if(!FAILED){
setProduction(29)
add_reduce(1,29);
return;
}
}
} else if(const_4_.includes(l.id)||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $pb$entries(l)
if(!FAILED){
setProduction(29)
add_reduce(1,29);
return;
}
}
fail(l);}
    function $pb$entries(l:Lexer) :void{_skip(l, const__)
if(const_2_.includes(l.id)||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $pb$body_entries(l)
_skip(l, const__)
if(l.id == 54||l.id == 55){
 $fn$reduce_function(l)
if(!FAILED){
setProduction(30)
add_reduce(2,30);
return;
}
} else {
 if(!FAILED){
setProduction(30)
add_reduce(1,33);
return;
}
}
} else if(l.id == 20){
 $sym$empty_symbol(l)
if(!FAILED){
setProduction(30)
add_reduce(1,31);
return;
}
} else if(l.id == 58){
 $sym$EOF_symbol(l)
if(!FAILED){
setProduction(30)
add_reduce(1,32);
return;
}
}
fail(l);}
    
    function $pb$force_fork(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 37);
if(!FAILED){
_with_skip(l, const__, 38);
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(32)
add_reduce(3,37);
return;
}
}
}
fail(l);}
    function $pb$condition_clause(l:Lexer) :void{_skip(l, const__)
_no_check(l);
_skip(l, const__)
if(l.id == 40){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(33)
add_reduce(4,38);
return;
}
}
}
} else if(l.id == 41){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(33)
add_reduce(4,39);
return;
}
}
}
} else if(l.id == 42){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(33)
add_reduce(4,40);
return;
}
}
}
} else if(l.id == 43){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(33)
add_reduce(4,41);
return;
}
}
}
} else if(l.id == 44){
 _no_check(l);
if(!FAILED){
$sym$symbol(l)
if(!FAILED){
_with_skip(l, const__, 39);
if(!FAILED){
setProduction(33)
add_reduce(4,42);
return;
}
}
}
}
fail(l);}
    function $fn$referenced_function(l:Lexer) :void{_skip(l, const__)
$fn$js_function_start_symbol(l)
$sym$identifier(l)
_skip(l, const__)
if(l.id == 45){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(34)
add_reduce(4,43);
return;
}
}
} else if(l.id == 46){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 47);
if(!FAILED){
setProduction(34)
add_reduce(5,44);
return;
}
}
}
}
fail(l);}
    function $fn$error_function(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 48);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
_with_skip(l, const_1_, 46);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 47);
if(!FAILED){
_with_skip(l, const_1_, 46);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 47);
if(!FAILED){
setProduction(35)
add_reduce(8,45);
return;
}
}
}
}
}
}
}
}
fail(l);}
    function $fn$reduce_function_group_07_100(l:Lexer) :void{_skip(l, const__)
if(l.id == 50){
 _no_check(l);
if(!FAILED){
setProduction(36)

return;
}
} else if(l.id == 51){
 _no_check(l);
if(!FAILED){
setProduction(36)

return;
}
} else if(l.id == 52){
 _no_check(l);
if(!FAILED){
setProduction(36)

return;
}
} else if(l.id == 53){
 _no_check(l);
if(!FAILED){
setProduction(36)

return;
}
}
fail(l);}
    function $fn$reduce_function(l:Lexer) :void{_skip(l, const__)
$fn$js_function_start_symbol(l)
$fn$reduce_function_group_07_100(l)
_skip(l, const__)
if(l.id == 46){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 47);
if(!FAILED){
setProduction(37)
add_reduce(5,46);
return;
}
}
}
} else if(l.id == 45){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(37)
add_reduce(4,47);
return;
}
}
} else if(l.id == 14){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(37)
add_reduce(4,48);
return;
}
}
}
fail(l);}
    function $fn$function_clause(l:Lexer) :void{_skip(l, const__)
$fn$js_function_start_symbol(l)
_skip(l, const__)
if(l.id == 46){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 47);
if(!FAILED){
setProduction(38)
add_reduce(4,49);
return;
}
}
}
} else if(l.id == 45){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(38)
add_reduce(3,50);
return;
}
}
}
fail(l);}
    
    function $fn$js_primitive_group_033_101(l:Lexer) :void{_skip(l, const__)
if(!(false )){
 $sym$terminal_symbol(l)
if(!FAILED){
setProduction(40)

return;
}
} else if(l.id == 58){
 $sym$EOF_symbol(l)
if(!FAILED){
setProduction(40)

return;
}
}
fail(l);}
    function $fn$js_primitive(l:Lexer) :void{_skip(l, const_1_)
if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(l.ty == 2){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(41)

return;
}
} else if(!(false )){
 $fn$js_primitive_group_033_101(l)
if(!FAILED){
setProduction(41)
add_reduce(1,51);
return;
}
}
fail(l);}
    function $fn$js_data_block(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const_1_, 46);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const_1_, 47);
if(!FAILED){
setProduction(42)
add_reduce(3,52);
return;
}
}
}
fail(l);}
    function $fn$js_function_start_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 54){
 _no_check(l);
if(!FAILED){
setProduction(43)

return;
}
} else if(l.id == 55){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
setProduction(43)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $cm$comment(l:Lexer) :void{_skip(l, const__)
$cm$cm(l)
if(!FAILED){
setProduction(44)

return;
}
fail(l);}
    function $cm$cm(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const_1_, 56);
if(!FAILED){
$cm$comment_data(l)
if(!FAILED){
$cm$comment_delimiter(l)
if(!FAILED){
setProduction(45)
add_reduce(3,53);
return;
}
}
}
fail(l);}
    function $cm$comment_delimiter(l:Lexer) :void{_skip(l, const_0_)
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(46)

return;
}
fail(l);}
    
    function $cm$comment_primitive(l:Lexer) :void{_skip(l, const_1_)
if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 2){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(48)

return;
}
}
fail(l);}
    
    
    function $sym$lexer_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 19||l.id == 61){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(l.id == 18||l.id == 62){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(l.id == 63){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(!(false )){
 $sym$grouped_symbol(l)
if(!FAILED){
$sym$grouped_delimiter(l)
if(!FAILED){
setProduction(55)
add_reduce(2,54);
return;
}
}
}
fail(l);}
    function $sym$grouped_delimiter(l:Lexer) :void{
if(l.ty == 4){
 _no_check(l);
if(!FAILED){
setProduction(56)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(56)

return;
}
}
fail(l);}
    function $sym$grouped_symbol_group_012_103(l:Lexer) :void{_skip(l, const__)
if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(!(false )){
 _no_check(l);
if(!FAILED){
setProduction(57)

return;
}
}
fail(l);}
    
    function $sym$ignore_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 19||l.id == 61){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(l.id == 18||l.id == 62){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(l.id == 63){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(!(false )){
 _no_check(l);
if(!FAILED){
setProduction(60)
add_reduce(1,54);
return;
}
}
fail(l);}
    function $sym$terminal_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 19||l.id == 61){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 18||l.id == 62){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 63){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 59||l.id == 60){
 $sym$assert_function_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(!(false )){
 _no_check(l);
if(!FAILED){
setProduction(61)
add_reduce(1,54);
return;
}
}
fail(l);}
    function $sym$symbol_group_032_105(l:Lexer) :void{_skip(l, const__)
if(l.id == 16){
 _no_check(l);
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 15){
 _no_check(l);
if(!FAILED){
setProduction(62)

return;
}
}
fail(l);}
    
    function $sym$EOF_symbol(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 0);
if(!FAILED){
setProduction(64)
add_reduce(1,58);
return;
}
fail(l);}
    function $sym$empty_symbol(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 20);
if(!FAILED){
setProduction(65)
add_reduce(1,59);
return;
}
fail(l);}
    function $sym$assert_function_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 59){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(66)
add_reduce(3,60);
return;
}
}
}
} else if(l.id == 60){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(66)
add_reduce(3,61);
return;
}
}
}
}
fail(l);}
    function $sym$generated_symbol_group_141_106(l:Lexer) :void{_skip(l, const__)
if(l.id == 19){
 _no_check(l);
if(!FAILED){
setProduction(67)

return;
}
} else if(l.id == 61){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
setProduction(67)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$generated_symbol(l:Lexer) :void{_skip(l, const__)
$sym$generated_symbol_group_141_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(68)
add_reduce(2,62);
return;
}
}
fail(l);}
    function $sym$literal_symbol_group_144_107(l:Lexer) :void{_skip(l, const__)
if(l.id == 18){
 _no_check(l);
if(!FAILED){
setProduction(69)

return;
}
} else if(l.id == 62){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 49);
if(!FAILED){
setProduction(69)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$literal_symbol_group_046_108(l:Lexer) :void{_skip(l, const__)
if(l.id == 78||l.id == 79||l.ty == 3||l.ty == 7){
 $sym$identifier(l)
if(!FAILED){
setProduction(70)

return;
}
} else if(l.ty == 2){
 $def$natural(l)
if(!FAILED){
setProduction(70)

return;
}
}
fail(l);}
    function $sym$literal_symbol(l:Lexer) :void{_skip(l, const__)
$sym$literal_symbol_group_144_107(l)
if(!FAILED){
$sym$literal_symbol_group_046_108(l)
if(!FAILED){
setProduction(71)
add_reduce(2,63);
return;
}
}
fail(l);}
    function $sym$escaped_symbol_group_050_109(l:Lexer) :void{_skip(l, const__)
if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(72)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(72)

return;
}
} else if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(72)

return;
}
}
fail(l);}
    function $sym$escaped_symbol(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 63);
if(!FAILED){
$sym$escaped_symbol_group_050_109(l)
if(!FAILED){
setProduction(73)
add_reduce(2,64);
return;
}
}
fail(l);}
    function $sym$production_symbol(l:Lexer) :void{_skip(l, const__)
$sym$identifier(l)
if(!FAILED){
setProduction(74)
add_reduce(1,65);
return;
}
fail(l);}
    function $sym$imported_production_symbol(l:Lexer) :void{_skip(l, const__)
$sym$production_id(l)
if(!FAILED){
_with_skip(l, const__, 17);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(75)
add_reduce(3,66);
return;
}
}
}
fail(l);}
    function $sym$production_id(l:Lexer) :void{_skip(l, const__)
$sym$identifier(l)
if(!FAILED){
setProduction(76)

return;
}
fail(l);}
    function $sym$identifier(l:Lexer) :void{_skip(l, const__)
$def$js_identifier(l)
if(!FAILED){
setProduction(77)

return;
}
fail(l);}
    function $sym$js_identifier(l:Lexer) :void{_skip(l, const__)
$def$id(l)
if(!FAILED){
setProduction(78)

return;
}
fail(l);}
    function $def$natural(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 2);
if(!FAILED){
setProduction(90)

return;
}
fail(l);}
    function $def$id(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 3);
if(!FAILED){
setProduction(91)

return;
}
fail(l);}
    function $def$js_identifier(l:Lexer) :void{_skip(l, const__)
$def$js_id_symbols(l)
if(!FAILED){
setProduction(99)

return;
}
fail(l);}
    
    function $pre$preamble(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 56){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 4:
State2(l)
 break;
case 3:
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 20||l.id == 54||l.id == 55||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State1(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State1(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 56){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 4:
State141(l)
 break;
case 3: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State2(l:Lexer):void{
_skip(l, const__)
if(idm2r.has(l.id)){idm2r.get(l.id)(l); return;} else if(tym2r.has(l.ty)){tym2r.get(l.ty)(l); return;}
else fail(l);
}
    function $pre$import_preamble_HC_listbody1_104(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 14:
_skip(l, const_1_)
if(l.ty == 0||l.ty == 1){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State15(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 13:
State16(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State15(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 13:
State175(l)
 break;
case 14: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State16(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(13,1,14); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody2_102(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State23(l);
             
            }
else fail(l);
}
    function State23(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(5,1,12); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody4_105(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State26(l);
             
            }
else fail(l);
}
    function State26(l:Lexer):void{
_skip(l, const_1_)
if(l.id == 28||l.id == 29||l.ty == 0||l.ty == 1){ 
             
            completeProduction(5,1,15); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$symbols_preamble_HC_listbody2_101(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 18||l.id == 19||l.id == 61||l.id == 62||l.id == 63||l.ty == 3||l.ty == 6){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 4 )){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55:
State32(l)
 break;
case 5:
_skip(l, const_0_)
if(l.ty == 0||l.ty == 4){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State31(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State31(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 18||l.id == 19||l.id == 61||l.id == 62||l.id == 63||l.ty == 3||l.ty == 6){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 4 )){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55:
State183(l)
 break;
case 5: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State32(l:Lexer):void{
_skip(l, const_0_)
if(idm32r.has(l.id)){idm32r.get(l.id)(l); return;} else if(tym32r.has(l.ty)){tym32r.get(l.ty)(l); return;}
else fail(l);
}
    function State44(l:Lexer):void{
if(!(!(false ) )){ 
             
            completeProduction(13,1,59); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $prd$productions(l:Lexer):void{
_skip(l, const__)
if(idm48.has(l.id)){idm48.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 34:
State50(l)
 break;
case 24:
State49(l)
 break;
case 19:
_skip(l, const__)
if(l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State51(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State49(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(15,1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State50(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(16,1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State51(l:Lexer):void{
_skip(l, const__)
if(idm51.has(l.id)){idm51.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State207(l)
 break;
case 34:
State208(l)
 break;
case 24:
State206(l)
 break;
case 19: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State52(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProductionPlain(1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State53(l:Lexer):void{
_skip(l, const__)
if(l.id == 78||l.id == 79||l.ty == 3||l.ty == 7){ 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_08_100(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $prd$production_group_013_103(l); stack_ptr++;;
        }else l.sync(cp);
         
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 23:
State214(l)
 break;
case 20:
State213(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State54(l:Lexer):void{
_skip(l, const__)
if(l.id == 78||l.id == 79||l.ty == 3||l.ty == 7){ 
             
            $prd$production_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 23:
State219(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $cm$comment_data(l:Lexer):void{
if(l.ty == 1||l.ty == 2||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48:
State59(l)
 break;
case 47:
if(l.ty == 0||l.ty == 4){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State60(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State59(l:Lexer):void{
if(tym59r.has(l.ty)){tym59r.get(l.ty)(l); return;}
else fail(l);
}
    function State60(l:Lexer):void{
if(l.ty == 1||l.ty == 2||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48:
State211(l)
 break;
case 47: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$ignore_symbols(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 18||l.id == 19||l.id == 61||l.id == 62||l.id == 63){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 4 )){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60:
State92(l)
 break;
case 54:
_skip(l, const_0_)
if(l.ty == 0||l.ty == 4){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State91(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State91(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 18||l.id == 19||l.id == 61||l.id == 62||l.id == 63){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 4 )){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60:
State228(l)
 break;
case 54: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State92(l:Lexer):void{
_skip(l, const_0_)
if(idm92r.has(l.id)){idm92r.get(l.id)(l); return;} else if(tym92r.has(l.ty)){tym92r.get(l.ty)(l); return;}
else fail(l);
}
    function $sym$grouped_symbol(l:Lexer):void{
if(l.ty == 3||l.ty == 6){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 1||l.ty == 4 )){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 59:
if(l.ty == 0||l.ty == 1||l.ty == 4){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State94(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 57:
State44(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State94(l:Lexer):void{
if(l.ty == 3||l.ty == 6){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            } else if(!(l.ty == 0||l.ty == 1||l.ty == 4 )){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 57:
State186(l)
 break;
case 59: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$condition_symbol_list(l:Lexer):void{
_skip(l, const__)
if(l.id == 18||l.id == 19||l.id == 59||l.id == 60||l.id == 61||l.id == 62||l.id == 63){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            } else if(!(l.id == 39||l.ty == 0 )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61:
State97(l)
 break;
case 50:
_skip(l, const__)
if(l.id == 39||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State96(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State96(l:Lexer):void{
_skip(l, const__)
if(l.id == 18||l.id == 19||l.id == 59||l.id == 60||l.id == 61||l.id == 62||l.id == 63){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            } else if(!(l.id == 39||l.ty == 0 )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61:
State229(l)
 break;
case 50: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State97(l:Lexer):void{
_skip(l, const__)
if(idm97r.has(l.id)){idm97r.get(l.id)(l); return;} else if(tym97r.has(l.ty)){tym97r.get(l.ty)(l); return;}
else fail(l);
}
    function $fn$js_data(l:Lexer):void{
_skip(l, const_1_)
if(idm117.has(l.id)){idm117.get(l.id)(l); } else if(tym117.has(l.ty)){tym117.get(l.ty)(l); } else if(!(l.id == 47 )){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 42:
State119(l)
 break;
case 41:
State118(l)
 break;
case 39:
_skip(l, const_1_)
if(l.id == 47){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State120(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State118(l:Lexer):void{
_skip(l, const_1_)
if(idm121r.has(l.id)){idm121r.get(l.id)(l); return;} else if(tym121r.has(l.ty)){tym121r.get(l.ty)(l); return;}
else fail(l);
}
    function State119(l:Lexer):void{
_skip(l, const_1_)
if(idm121r.has(l.id)){idm121r.get(l.id)(l); return;} else if(tym121r.has(l.ty)){tym121r.get(l.ty)(l); return;}
else fail(l);
}
    function State120(l:Lexer):void{
_skip(l, const_1_)
if(idm120.has(l.id)){idm120.get(l.id)(l); } else if(tym117.has(l.ty)){tym117.get(l.ty)(l); } else if(!(l.id == 47 )){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 42:
State259(l)
 break;
case 41:
State258(l)
 break;
case 39: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State121(l:Lexer):void{
_skip(l, const_1_)
if(idm121r.has(l.id)){idm121r.get(l.id)(l); return;} else if(tym121r.has(l.ty)){tym121r.get(l.ty)(l); return;}
else fail(l);
}
    function State141(l:Lexer):void{
_skip(l, const__)
if(idm141r.has(l.id)){idm141r.get(l.id)(l); return;} else if(tym141r.has(l.ty)){tym141r.get(l.ty)(l); return;}
else fail(l);
}
    function State165(l:Lexer):void{
if(idm203r.has(l.id)){idm203r.get(l.id)(l); return;} else if(tym203r.has(l.ty)){tym203r.get(l.ty)(l); return;}
else fail(l);
}
    function State175(l:Lexer):void{
_skip(l, const_1_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(12,2,14); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State183(l:Lexer):void{
_skip(l, const_0_)
if(idm183r.has(l.id)){idm183r.get(l.id)(l); return;} else if(tym183r.has(l.ty)){tym183r.get(l.ty)(l); return;}
else fail(l);
}
    function State186(l:Lexer):void{
if(!(!(false ) )){ 
             
            completeProduction(12,2,59); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State203(l:Lexer):void{
if(idm203r.has(l.id)){idm203r.get(l.id)(l); return;} else if(tym203r.has(l.ty)){tym203r.get(l.ty)(l); return;}
else fail(l);
}
    function State204(l:Lexer):void{
if(idm203r.has(l.id)){idm203r.get(l.id)(l); return;} else if(tym203r.has(l.ty)){tym203r.get(l.ty)(l); return;}
else fail(l);
}
    function State205(l:Lexer):void{
if(idm203r.has(l.id)){idm203r.get(l.id)(l); return;} else if(tym203r.has(l.ty)){tym203r.get(l.ty)(l); return;}
else fail(l);
}
    function State206(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(17,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State207(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(1,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State208(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(18,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State211(l:Lexer):void{
if(tym211r.has(l.ty)){tym211r.get(l.ty)(l); return;}
else fail(l);
}
    function State213(l:Lexer):void{
_skip(l, const__)
if(l.id == 33||l.id == 34){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25:
State297(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State214(l:Lexer):void{
_skip(l, const__)
if(l.id == 33||l.id == 34){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25:
State294(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State219(l:Lexer):void{
_skip(l, const__)
if(l.id == 33||l.id == 34){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25:
State298(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $def$js_id_symbols(l:Lexer):void{
_skip(l, const_0_)
if(idm225.has(l.id)){idm225.get(l.id)(l); } else if(tym225.has(l.ty)){tym225.get(l.ty)(l); }
else fail(l);
}
    function State228(l:Lexer):void{
_skip(l, const_0_)
if(idm228r.has(l.id)){idm228r.get(l.id)(l); return;} else if(tym228r.has(l.ty)){tym228r.get(l.ty)(l); return;}
else fail(l);
}
    function State229(l:Lexer):void{
_skip(l, const__)
if(idm229r.has(l.id)){idm229r.get(l.id)(l); return;} else if(tym229r.has(l.ty)){tym229r.get(l.ty)(l); return;}
else fail(l);
}
    function $pb$production_bodies(l:Lexer):void{
_skip(l, const__)
if(idm303.has(l.id)){idm303.get(l.id)(l); } else if(tym303.has(l.ty)){tym303.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29:
State235(l)
 break;
case 28:
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 39||l.id == 54||l.id == 55||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State236(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State235(l:Lexer):void{
_skip(l, const__)
if(idm235r.has(l.id)){idm235r.get(l.id)(l); return;} else if(tym235r.has(l.ty)){tym235r.get(l.ty)(l); return;}
else fail(l);
}
    function State236(l:Lexer):void{
_skip(l, const__)
if(idm354.has(l.id)){idm354.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State304(l)
 break;
case 27:
State303(l)
 break;
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State238(l:Lexer):void{
_skip(l, const__)
if(idm238r.has(l.id)){idm238r.get(l.id)(l); return;} else if(tym238r.has(l.ty)){tym238r.get(l.ty)(l); return;}
else fail(l);
}
    function State240(l:Lexer):void{
_skip(l, const__)
if(idm240.has(l.id)){idm240.get(l.id)(l); } else if(tym333.has(l.ty)){tym333.get(l.ty)(l); } else if(idm240r.has(l.id)){idm240r.get(l.id)(l); return;} else if(tym240r.has(l.ty)){tym240r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State331(l)
 break;
case 38:
State329(l)
 break;
case 37:
State328(l)
 break;
case 33:
State330(l)
 break;
case 30:
case 31: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State243(l:Lexer):void{
_skip(l, const__)
if(idm243.has(l.id)){idm243.get(l.id)(l); } else if(idm243r.has(l.id)){idm243r.get(l.id)(l); return;} else if(tym243r.has(l.ty)){tym243r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State309(l)
 break;
case 31:
case 63: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State244(l:Lexer):void{
_skip(l, const__)
if(idm243r.has(l.id)){idm243r.get(l.id)(l); return;} else if(tym243r.has(l.ty)){tym243r.get(l.ty)(l); return;}
else fail(l);
}
    function State245(l:Lexer):void{
_skip(l, const__)
if(idm243r.has(l.id)){idm243r.get(l.id)(l); return;} else if(tym243r.has(l.ty)){tym243r.get(l.ty)(l); return;}
else fail(l);
}
    function State246(l:Lexer):void{
_skip(l, const__)
if(idm246.has(l.id)){idm246.get(l.id)(l); } else if(tym246.has(l.ty)){tym246.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 31:
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 31||l.id == 32||l.id == 39||l.id == 56||l.ty == 0){ return;}
State337(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State247(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State248(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State249(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State250(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State251(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State252(l:Lexer):void{
_skip(l, const__)
if(idm249r.has(l.id)){idm249r.get(l.id)(l); return;} else if(tym249r.has(l.ty)){tym249r.get(l.ty)(l); return;}
else fail(l);
}
    function State253(l:Lexer):void{
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State254(l:Lexer):void{
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State258(l:Lexer):void{
_skip(l, const_1_)
if(idm259r.has(l.id)){idm259r.get(l.id)(l); return;} else if(tym259r.has(l.ty)){tym259r.get(l.ty)(l); return;}
else fail(l);
}
    function State259(l:Lexer):void{
_skip(l, const_1_)
if(idm259r.has(l.id)){idm259r.get(l.id)(l); return;} else if(tym259r.has(l.ty)){tym259r.get(l.ty)(l); return;}
else fail(l);
}
    function State294(l:Lexer):void{
_skip(l, const__)
if(idm294.has(l.id)){idm294.get(l.id)(l); } else if(tym294.has(l.ty)){tym294.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28:
State354(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State297(l:Lexer):void{
_skip(l, const__)
if(idm294.has(l.id)){idm294.get(l.id)(l); } else if(tym294.has(l.ty)){tym294.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28:
State360(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State298(l:Lexer):void{
_skip(l, const__)
if(idm294.has(l.id)){idm294.get(l.id)(l); } else if(tym294.has(l.ty)){tym294.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28:
State361(l)
 break;
case 24: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$symbol(l:Lexer):void{
_skip(l, const__)
if(idm299.has(l.id)){idm299.get(l.id)(l); } else if(tym299.has(l.ty)){tym299.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 75:
State249(l)
 break;
case 74:
State248(l)
 break;
case 73:
State251(l)
 break;
case 71:
State250(l)
 break;
case 68:
State247(l)
 break;
case 66:
State252(l)
 break;
case 63:
_skip(l, const__)
if(const_7_.includes(l.id)||l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State301(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State300(l:Lexer):void{
_skip(l, const__)
if(idm294.has(l.id)){idm294.get(l.id)(l); } else if(tym294.has(l.ty)){tym294.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
_skip(l, const__)
if(const_7_.includes(l.id)||l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ return;}
State243(l)
 break;
case 31:
State240(l)
 break;
case 30:
State238(l)
 break;
case 29:
State235(l)
 break;
case 28:
State339(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State301(l:Lexer):void{
_skip(l, const__)
if(idm243.has(l.id)){idm243.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State309(l)
 break;
case 63: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State303(l:Lexer):void{
_skip(l, const__)
if(idm303.has(l.id)){idm303.get(l.id)(l); } else if(tym303.has(l.ty)){tym303.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29:
State363(l)
 break;
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State304(l:Lexer):void{
_skip(l, const__)
if(idm304r.has(l.id)){idm304r.get(l.id)(l); return;} else if(tym304r.has(l.ty)){tym304r.get(l.ty)(l); return;}
else fail(l);
}
    function State308(l:Lexer):void{
_skip(l, const__)
if(idm308r.has(l.id)){idm308r.get(l.id)(l); return;} else if(tym308r.has(l.ty)){tym308r.get(l.ty)(l); return;}
else fail(l);
}
    function State309(l:Lexer):void{
_skip(l, const__)
if(idm309.has(l.id)){idm309.get(l.id)(l); } else if(!(const_6_.includes(l.id)||l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7 )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61:
State345(l)
 break;
case 63: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State328(l:Lexer):void{
_skip(l, const__)
if(idm328r.has(l.id)){idm328r.get(l.id)(l); return;} else if(tym328r.has(l.ty)){tym328r.get(l.ty)(l); return;}
else fail(l);
}
    function State329(l:Lexer):void{
_skip(l, const__)
if(idm331r.has(l.id)){idm331r.get(l.id)(l); return;} else if(tym331r.has(l.ty)){tym331r.get(l.ty)(l); return;}
else fail(l);
}
    function State330(l:Lexer):void{
_skip(l, const__)
if(idm331r.has(l.id)){idm331r.get(l.id)(l); return;} else if(tym331r.has(l.ty)){tym331r.get(l.ty)(l); return;}
else fail(l);
}
    function State331(l:Lexer):void{
_skip(l, const__)
if(idm243.has(l.id)){idm243.get(l.id)(l); } else if(idm331r.has(l.id)){idm331r.get(l.id)(l); return;} else if(tym331r.has(l.ty)){tym331r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State309(l)
 break;
case 31:
case 63: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pb$body_entries(l:Lexer):void{
_skip(l, const__)
if(idm333.has(l.id)){idm333.get(l.id)(l); } else if(tym333.has(l.ty)){tym333.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State243(l)
 break;
case 38:
State245(l)
 break;
case 33:
State244(l)
 break;
case 31:
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 31||l.id == 32||l.id == 36||l.id == 39||l.id == 56||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State334(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State334(l:Lexer):void{
_skip(l, const__)
if(idm334.has(l.id)){idm334.get(l.id)(l); } else if(tym333.has(l.ty)){tym333.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State331(l)
 break;
case 38:
State329(l)
 break;
case 33:
State330(l)
 break;
case 31: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State337(l:Lexer):void{
_skip(l, const__)
if(idm337.has(l.id)){idm337.get(l.id)(l); } else if(tym333.has(l.ty)){tym333.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State331(l)
 break;
case 38:
State329(l)
 break;
case 33:
State330(l)
 break;
case 31: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State339(l:Lexer):void{
_skip(l, const__)
if(idm339.has(l.id)){idm339.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State304(l)
 break;
case 27:
State303(l)
 break;
case 63:
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State345(l:Lexer):void{
_skip(l, const__)
if(l.id == 39){ 
             
            _no_check(l);;stack_ptr++;State370(l);
             
            }
else fail(l);
}
    function State346(l:Lexer):void{
_skip(l, const__)
if(idm346r.has(l.id)){idm346r.get(l.id)(l); return;} else if(tym346r.has(l.ty)){tym346r.get(l.ty)(l); return;}
else fail(l);
}
    function State354(l:Lexer):void{
_skip(l, const__)
if(idm354.has(l.id)){idm354.get(l.id)(l); } else if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(22,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State304(l)
 break;
case 27:
State303(l)
 break;
case 24:
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State360(l:Lexer):void{
_skip(l, const__)
if(idm360.has(l.id)){idm360.get(l.id)(l); } else if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(24,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State304(l)
 break;
case 27:
State303(l)
 break;
case 22:
State379(l)
 break;
case 24:
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State361(l:Lexer):void{
_skip(l, const__)
if(idm354.has(l.id)){idm354.get(l.id)(l); } else if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(23,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44:
State304(l)
 break;
case 27:
State303(l)
 break;
case 24:
case 28: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State363(l:Lexer):void{
_skip(l, const__)
if(idm363r.has(l.id)){idm363r.get(l.id)(l); return;} else if(tym363r.has(l.ty)){tym363r.get(l.ty)(l); return;}
else fail(l);
}
    function State365(l:Lexer):void{
_skip(l, const__)
if(idm365r.has(l.id)){idm365r.get(l.id)(l); return;} else if(tym365r.has(l.ty)){tym365r.get(l.ty)(l); return;}
else fail(l);
}
    function State370(l:Lexer):void{
_skip(l, const__)
if(idm370r.has(l.id)){idm370r.get(l.id)(l); return;} else if(tym370r.has(l.ty)){tym370r.get(l.ty)(l); return;}
else fail(l);
}
    function State372(l:Lexer):void{
_skip(l, const__)
if(idm372r.has(l.id)){idm372r.get(l.id)(l); return;} else if(tym372r.has(l.ty)){tym372r.get(l.ty)(l); return;}
else fail(l);
}
    function State379(l:Lexer):void{
_skip(l, const__)
if(l.id == 12||l.id == 13||l.id == 54||l.id == 55||l.id == 56||l.ty == 0){ 
             
            completeProduction(21,5,24); stack_ptr-=5;
             
            ;return}
else fail(l);
}
    function $prd$production(l:Lexer):void{
_skip(l, const__)
if(idm404.has(l.id)){idm404.get(l.id)(l); }
else fail(l);
}

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

    $hydrocarbon(lex);

    set_action(0);

    set_error(0);

    return FAILED || !lex.END;    
}