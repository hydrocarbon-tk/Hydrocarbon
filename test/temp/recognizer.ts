
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
if(val == 70 ){
if(length <= 1){type = TokenKeyword; this.id =73; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 75 ){
if(length <= 4){type = TokenKeyword; this.id =29; length = 4;}
}
}
}
}
else if(val == 69 ){
if(length <= 1){type = TokenKeyword; this.id =72; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 88 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 67 ){
if(length <= 3){type = TokenKeyword; this.id =31; length = 3;}
}
else if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =53; length = 3;}
}
}
else if(val == 82 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
if(length <= 3){type = TokenKeyword; this.id =32; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
if(length <= 5){type = TokenKeyword; this.id =51; length = 5;}
}
}
}
}
}
else if(val == 73 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 71 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 78 ){
if(length <= 3){type = TokenKeyword; this.id =33; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 69 ){
if(length <= 6){type = TokenKeyword; this.id =50; length = 6;}
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
if(length <= 6){type = TokenKeyword; this.id =56; length = 6;}
}
}
}
}
}
}
else if(val == 82 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =34; length = 3;}
}
}
else if(val == 69 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 68 ){
if(length <= 3){type = TokenKeyword; this.id =35; length = 3;}
}
}
}
else if(val == 101 ){
if(length <= 1){type = TokenKeyword; this.id =67; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 104 ){
if(length <= 3){type = TokenKeyword; this.id =39; length = 3;}
}
}
}
else if(val == 99 ){
if(length <= 1){type = TokenKeyword; this.id =42; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 116 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 114 ){
if(length <= 4){type = TokenKeyword; this.id =41; length = 4;}
}
}
}
}
else if(val == 114 ){
if(length <= 1){type = TokenKeyword; this.id =44; length = 1;}
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
if(length <= 6){type = TokenKeyword; this.id =43; length = 6;}
}
}
}
}
}
}
else if(val == 102 ){
if(length <= 1){type = TokenKeyword; this.id =46; length = 1;}
}
else if(val == 83 ){
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
if(length <= 6){type = TokenKeyword; this.id =48; length = 6;}
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
if(length <= 4){type = TokenKeyword; this.id =49; length = 4;}
}
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
if(length <= 4){type = TokenKeyword; this.id =52; length = 4;}
}
}
}
}
else if(val == 65 ){
if(length <= 1){type = TokenKeyword; this.id =68; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
if(length <= 2){type = TokenKeyword; this.id =54; length = 2;}
}
}
else if(val == 97 ){
if(length <= 1){type = TokenKeyword; this.id =64; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
if(length <= 2){type = TokenKeyword; this.id =55; length = 2;}
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
type = TokenSymbol; this.id =28 /* ( */; length = 1;
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
type = TokenSymbol; this.id =30 /* ) */; length = 1;
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
type = TokenSymbol; this.id =40 /* : */; length = 1;
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
else if(val == 36 ){
type = TokenSymbol; this.id =79 /* $ */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 111 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 102 ){
type = TokenSymbol; this.id =21 /* $eof */; length = 4;
}
}
}
}
else if(val == 9474 ){
type = TokenSymbol; this.id =22 /* │ */; length = 1;
}
else if(val == 124 ){
type = TokenSymbol; this.id =23 /* | */; length = 1;
}
else if(val == 8594 ){
type = TokenSymbol; this.id =24 /* → */; length = 1;
}
else if(val == 62 ){
type = TokenSymbol; this.id =25 /* > */; length = 1;
}
else if(val == 91 ){
type = TokenSymbol; this.id =26 /* [ */; length = 1;
}
else if(val == 93 ){
type = TokenSymbol; this.id =27 /* ] */; length = 1;
}
else if(val == 94 ){
type = TokenSymbol; this.id =36 /* ^ */; length = 1;
}
else if(val == 123 ){
type = TokenSymbol; this.id =37 /* { */; length = 1;
}
else if(val == 125 ){
type = TokenSymbol; this.id =38 /* } */; length = 1;
}
else if(val == 8614 ){
type = TokenSymbol; this.id =45 /* ↦ */; length = 1;
}
else if(val == 64 ){
type = TokenSymbol; this.id =47 /* @ */; length = 1;
}
else if(val == 35 ){
type = TokenSymbol; this.id =57 /* # */; length = 1;
}
else if(val == 63 ){
type = TokenSymbol; this.id =58 /* ? */; length = 1;
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
    //stack_ptr++;
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function completeProductionPlain(len: u32, production: u32): void {
    //stack_ptr -= len;
    prod = production;
}

function add_reduce(sym_len: u32, body: u32): void {
    //stack_ptr -= sym_len;
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


const const__ = StaticArray.fromArray<u32>([1/* ws */,4/* nl */]),
const_2_ = StaticArray.fromArray<u32>([4/* nl */]),
const_1_ = StaticArray.fromArray<u32>([18/* τ */,19/* θ */,26/* [ */,28/* ( */,45/* ↦ */,46/* f */,59/* assert */,60/* shift */,61/* g */,62/* t */,63/* \ */,78/* _ */,79/* $ */]),
const_4_ = StaticArray.fromArray<u32>([1/* ws */]),
const_0_ = StaticArray.fromArray<u32>([17/* :: */,18/* τ */,19/* θ */,20/* ɛ */,21/* $eof */,26/* [ */,28/* ( */,31/* EXC */,32/* ERR */,33/* IGN */,34/* RST */,35/* RED */,37/* { */,40/* : */,45/* ↦ */,46/* f */,59/* assert */,60/* shift */,61/* g */,62/* t */,63/* \ */,78/* _ */,79/* $ */]),
const_3_ = StaticArray.fromArray<u32>([18/* τ */,19/* θ */,20/* ɛ */,21/* $eof */,26/* [ */,45/* ↦ */,46/* f */,59/* assert */,60/* shift */,61/* g */,62/* t */,63/* \ */,78/* _ */,79/* $ */]),
_0id0 = (l:Lexer):void => { 
             
            $prd$production(l); stack_ptr++;
             
            },
_0id2 = (l:Lexer):void => { 
             
            $fn$referenced_function(l); stack_ptr++;
             
            },
_3id2 = (l:Lexer):void => { 
             
            $cm$comment(l); stack_ptr++;
             
            },
_399id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State4(l);
             
            },
_399id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State5(l);
             
            },
_278id0 = (l:Lexer):void => { 
             
            $pb$production_bodies(l); stack_ptr++;
             
            },
_342id0 = (l:Lexer):void => { 
             
            $pb$production_bodies_group_04_100(l); stack_ptr++;
             
            },
_346id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_111_102(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$production_bodies_group_04_100(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_300id0 = (l:Lexer):void => { 
             
            completeProduction(8,2,12); stack_ptr-=2;
             
            },
_299id0 = (l:Lexer):void => { 
             
            $pb$production_body(l); stack_ptr++;
             
            },
_358id0 = (l:Lexer):void => { 
             
            completeProduction(14,3,12); stack_ptr-=3;
             
            },
_234id0 = (l:Lexer):void => { 
             
            completeProduction(13,1,12); stack_ptr-=1;
             
            },
_100id0 = (l:Lexer):void => { 
             
            $fn$js_primitive(l); stack_ptr++;
             
            },
_100id8 = (l:Lexer):void => { 
             
            $fn$js_data_block(l); stack_ptr++;
             
            },
const_5_ = (l:Lexer):void => { 
             
            completeProduction(0,0,23); stack_ptr-=0;
             
            },
_102id0 = (l:Lexer):void => { 
             
            completeProduction(0,1,23); stack_ptr-=1;
             
            },
_228id0 = (l:Lexer):void => { 
             
            completeProduction(38,2,23); stack_ptr-=2;
             
            },
_85id0 = (l:Lexer):void => { 
             
            completeProduction(42,1,54); stack_ptr-=1;
             
            },
_220id0 = (l:Lexer):void => { 
             
            completeProduction(41,2,54); stack_ptr-=2;
             
            },
_38id0 = (l:Lexer):void => { 
             
            completeProduction(42,1,31); stack_ptr-=1;
             
            },
_199id0 = (l:Lexer):void => { 
             
            completeProduction(41,2,31); stack_ptr-=2;
             
            },
_58ty0 = (l:Lexer):void => { 
             
            completeProduction(8,1,47); stack_ptr-=1;
             
            },
_211ty0 = (l:Lexer):void => { 
             
            completeProduction(38,2,47); stack_ptr-=2;
             
            },
_309id0 = (l:Lexer):void => { 
             
            $sym$symbol(l); stack_ptr++;
             
            },
_309id9 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$condition_clause(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_309id10 = (l:Lexer):void => { 
             
            $fn$function_clause(l); stack_ptr++;
             
            },
_309id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State245(l);
             
            },
_245id0 = (l:Lexer):void => { 
             
            $pb$body_entries(l); stack_ptr++;
             
            },
_242id0 = (l:Lexer):void => { 
             
            $sym$symbol_group_032_105(l); stack_ptr++;
             
            },
_242id2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State303(l);
             
            },
const_6_ = (l:Lexer):void => { 
             
            completeProduction(21,1,15); stack_ptr-=1;
             
            },
_310id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $pb$condition_clause(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_324id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State363(l);
             
            },
_303id0 = (l:Lexer):void => { 
             
            completeProduction(53,2,63); stack_ptr-=2;
             
            },
_304id0 = (l:Lexer):void => { 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            },
_304id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State341(l);
             
            },
const_7_ = StaticArray.fromArray<u32>([12/* <> */,13/* +> */,15/* (* */,16/* (+ */,22/* │ */,23/* | */,27/* ] */,28/* ( */,45/* ↦ */,46/* f */,57/* # */,58/* ? */,78/* _ */,79/* $ */]),
_321id0 = (l:Lexer):void => { 
             
            completeProduction(22,2,15); stack_ptr-=2;
             
            },
_363id0 = (l:Lexer):void => { 
             
            completeProduction(23,3,15); stack_ptr-=3;
             
            },
_341id0 = (l:Lexer):void => { 
             
            completeProduction(50,3,63); stack_ptr-=3;
             
            },
_364id0 = (l:Lexer):void => { 
             
            completeProduction(50,4,63); stack_ptr-=4;
             
            },
_224id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State173(l);
             
            },
_224id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State174(l);
             
            },
_224ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State175(l);
             
            },
_224ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State160(l);
             
            },
_173id0 = (l:Lexer):void => { 
             
            completeProduction(0,1,100); stack_ptr-=1;
             
            },
_296id0 = (l:Lexer):void => { 
             
            $sym$generated_symbol(l); stack_ptr++;
             
            },
_296id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$production_symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$imported_production_symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_296id4 = (l:Lexer):void => { 
             
            $sym$literal_symbol(l); stack_ptr++;
             
            },
_296id6 = (l:Lexer):void => { 
             
            $sym$escaped_symbol(l); stack_ptr++;
             
            },
_296id7 = (l:Lexer):void => { 
             
            $sym$assert_function_symbol(l); stack_ptr++;
             
            },
_296id9 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State297(l);
             
            },
_296ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State252(l);
             
            },
_296ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State253(l);
             
            },
const_8_ = StaticArray.fromArray<u32>([12/* <> */,13/* +> */,18/* τ */,19/* θ */,22/* │ */,23/* | */,27/* ] */,28/* ( */,30/* ) */,45/* ↦ */,46/* f */,57/* # */,59/* assert */,60/* shift */,61/* g */,62/* t */,63/* \ */,78/* _ */,79/* $ */]),
_252id0 = (l:Lexer):void => { 
             
            completeProduction(52,1,63); stack_ptr-=1;
             
            },
_253id0 = (l:Lexer):void => { 
             
            completeProduction(0,1,63); stack_ptr-=1;
             
            },
_239id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $fn$reduce_function(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $fn$function_clause(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
const_9_ = (l:Lexer):void => { 
             
            completeProduction(20,1,14); stack_ptr-=1;
             
            },
_237id0 = (l:Lexer):void => { 
             
            completeProduction(16,1,13); stack_ptr-=1;
             
            },
_334id3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State359(l);
             
            },
_318id0 = (l:Lexer):void => { 
             
            completeProduction(17,2,14); stack_ptr-=2;
             
            },
_75id0 = (l:Lexer):void => { 
             
            completeProduction(42,1,50); stack_ptr-=1;
             
            },
_217id0 = (l:Lexer):void => { 
             
            completeProduction(41,2,50); stack_ptr-=2;
             
            };
const idm0: Map<number, (L:Lexer)=>void> = new Map()
idm0.set(12/* <> */,_0id0)
idm0.set(13/* +> */,_0id0)
idm0.set(45/* ↦ */,_0id2)
idm0.set(46/* f */,_0id2);
const idm3: Map<number, (L:Lexer)=>void> = new Map()
idm3.set(12/* <> */,_0id0)
idm3.set(13/* +> */,_0id0)
idm3.set(57/* # */,_3id2)
idm3.set(45/* ↦ */,_0id2)
idm3.set(46/* f */,_0id2);
const idm399: Map<number, (L:Lexer)=>void> = new Map()
idm399.set(12/* <> */,_399id0)
idm399.set(13/* +> */,_399id1);
const idm278: Map<number, (L:Lexer)=>void> = new Map()
idm278.set(28/* ( */,_278id0)
idm278.set(19/* θ */,_278id0)
idm278.set(61/* g */,_278id0)
idm278.set(78/* _ */,_278id0)
idm278.set(79/* $ */,_278id0)
idm278.set(18/* τ */,_278id0)
idm278.set(62/* t */,_278id0)
idm278.set(63/* \ */,_278id0)
idm278.set(59/* assert */,_278id0)
idm278.set(60/* shift */,_278id0)
idm278.set(45/* ↦ */,_278id0)
idm278.set(46/* f */,_278id0)
idm278.set(26/* [ */,_278id0)
idm278.set(20/* ɛ */,_278id0)
idm278.set(21/* $eof */,_278id0);
const tym278: Map<number, (L:Lexer)=>void> = new Map()
tym278.set(3/* id */,_278id0)
tym278.set(7/* key */,_278id0)
tym278.set(6/* sym */,_278id0)
tym278.set(5/* tok */,_278id0);
const idm342: Map<number, (L:Lexer)=>void> = new Map()
idm342.set(22/* │ */,_342id0)
idm342.set(23/* | */,_342id0)
idm342.set(57/* # */,_3id2);
const idm346: Map<number, (L:Lexer)=>void> = new Map()
idm346.set(22/* │ */,_346id0)
idm346.set(23/* | */,_346id0)
idm346.set(57/* # */,_3id2);
const idm300r: Map<number, (L:Lexer)=>void> = new Map()
idm300r.set(22/* │ */,_300id0)
idm300r.set(23/* | */,_300id0)
idm300r.set(57/* # */,_300id0)
idm300r.set(30/* ) */,_300id0)
idm300r.set(12/* <> */,_300id0)
idm300r.set(13/* +> */,_300id0)
idm300r.set(45/* ↦ */,_300id0)
idm300r.set(46/* f */,_300id0);
const tym300r: Map<number, (L:Lexer)=>void> = new Map()
tym300r.set(0/* EOF */,_300id0);
const idm299: Map<number, (L:Lexer)=>void> = new Map()
idm299.set(28/* ( */,_299id0)
idm299.set(19/* θ */,_299id0)
idm299.set(61/* g */,_299id0)
idm299.set(78/* _ */,_299id0)
idm299.set(79/* $ */,_299id0)
idm299.set(18/* τ */,_299id0)
idm299.set(62/* t */,_299id0)
idm299.set(63/* \ */,_299id0)
idm299.set(59/* assert */,_299id0)
idm299.set(60/* shift */,_299id0)
idm299.set(45/* ↦ */,_299id0)
idm299.set(46/* f */,_299id0)
idm299.set(26/* [ */,_299id0)
idm299.set(20/* ɛ */,_299id0)
idm299.set(21/* $eof */,_299id0);
const tym299: Map<number, (L:Lexer)=>void> = new Map()
tym299.set(3/* id */,_299id0)
tym299.set(7/* key */,_299id0)
tym299.set(6/* sym */,_299id0)
tym299.set(5/* tok */,_299id0);
const idm358r: Map<number, (L:Lexer)=>void> = new Map()
idm358r.set(22/* │ */,_358id0)
idm358r.set(23/* | */,_358id0)
idm358r.set(57/* # */,_358id0)
idm358r.set(30/* ) */,_358id0)
idm358r.set(12/* <> */,_358id0)
idm358r.set(13/* +> */,_358id0)
idm358r.set(45/* ↦ */,_358id0)
idm358r.set(46/* f */,_358id0);
const tym358r: Map<number, (L:Lexer)=>void> = new Map()
tym358r.set(0/* EOF */,_358id0);
const idm234r: Map<number, (L:Lexer)=>void> = new Map()
idm234r.set(22/* │ */,_234id0)
idm234r.set(23/* | */,_234id0)
idm234r.set(57/* # */,_234id0)
idm234r.set(30/* ) */,_234id0)
idm234r.set(12/* <> */,_234id0)
idm234r.set(13/* +> */,_234id0)
idm234r.set(45/* ↦ */,_234id0)
idm234r.set(46/* f */,_234id0);
const tym234r: Map<number, (L:Lexer)=>void> = new Map()
tym234r.set(0/* EOF */,_234id0);
const idm100: Map<number, (L:Lexer)=>void> = new Map()
idm100.set(19/* θ */,_100id0)
idm100.set(61/* g */,_100id0)
idm100.set(18/* τ */,_100id0)
idm100.set(62/* t */,_100id0)
idm100.set(63/* \ */,_100id0)
idm100.set(59/* assert */,_100id0)
idm100.set(60/* shift */,_100id0)
idm100.set(21/* $eof */,_100id0)
idm100.set(37/* { */,_100id8);
const tym100: Map<number, (L:Lexer)=>void> = new Map()
tym100.set(3/* id */,_100id0)
tym100.set(2/* num */,_100id0)
tym100.set(1/* ws */,_100id0)
tym100.set(6/* sym */,_100id0)
tym100.set(5/* tok */,_100id0)
tym100.set(7/* key */,_100id0);
const idm100r: Map<number, (L:Lexer)=>void> = new Map()
idm100r.set(19/* θ */,const_5_)
idm100r.set(61/* g */,const_5_)
idm100r.set(18/* τ */,const_5_)
idm100r.set(62/* t */,const_5_)
idm100r.set(63/* \ */,const_5_)
idm100r.set(59/* assert */,const_5_)
idm100r.set(60/* shift */,const_5_)
idm100r.set(21/* $eof */,const_5_)
idm100r.set(37/* { */,const_5_)
idm100r.set(38/* } */,const_5_);
const tym100r: Map<number, (L:Lexer)=>void> = new Map()
tym100r.set(3/* id */,const_5_)
tym100r.set(2/* num */,const_5_)
tym100r.set(1/* ws */,const_5_)
tym100r.set(6/* sym */,const_5_)
tym100r.set(5/* tok */,const_5_)
tym100r.set(7/* key */,const_5_)
tym100r.set(88,const_5_);
const idm102r: Map<number, (L:Lexer)=>void> = new Map()
idm102r.set(38/* } */,_102id0)
idm102r.set(19/* θ */,_102id0)
idm102r.set(61/* g */,_102id0)
idm102r.set(18/* τ */,_102id0)
idm102r.set(62/* t */,_102id0)
idm102r.set(63/* \ */,_102id0)
idm102r.set(59/* assert */,_102id0)
idm102r.set(60/* shift */,_102id0)
idm102r.set(21/* $eof */,_102id0)
idm102r.set(37/* { */,_102id0);
const tym102r: Map<number, (L:Lexer)=>void> = new Map()
tym102r.set(3/* id */,_102id0)
tym102r.set(2/* num */,_102id0)
tym102r.set(1/* ws */,_102id0)
tym102r.set(6/* sym */,_102id0)
tym102r.set(5/* tok */,_102id0)
tym102r.set(7/* key */,_102id0)
tym102r.set(88,_102id0);
const idm228r: Map<number, (L:Lexer)=>void> = new Map()
idm228r.set(38/* } */,_228id0)
idm228r.set(19/* θ */,_228id0)
idm228r.set(61/* g */,_228id0)
idm228r.set(18/* τ */,_228id0)
idm228r.set(62/* t */,_228id0)
idm228r.set(63/* \ */,_228id0)
idm228r.set(59/* assert */,_228id0)
idm228r.set(60/* shift */,_228id0)
idm228r.set(21/* $eof */,_228id0)
idm228r.set(37/* { */,_228id0);
const tym228r: Map<number, (L:Lexer)=>void> = new Map()
tym228r.set(3/* id */,_228id0)
tym228r.set(2/* num */,_228id0)
tym228r.set(1/* ws */,_228id0)
tym228r.set(6/* sym */,_228id0)
tym228r.set(5/* tok */,_228id0)
tym228r.set(7/* key */,_228id0)
tym228r.set(88,_228id0);
const idm85r: Map<number, (L:Lexer)=>void> = new Map()
idm85r.set(19/* θ */,_85id0)
idm85r.set(61/* g */,_85id0)
idm85r.set(18/* τ */,_85id0)
idm85r.set(62/* t */,_85id0)
idm85r.set(63/* \ */,_85id0);
const tym85r: Map<number, (L:Lexer)=>void> = new Map()
tym85r.set(4/* nl */,_85id0)
tym85r.set(88,_85id0)
tym85r.set(0/* EOF */,_85id0);
const idm220r: Map<number, (L:Lexer)=>void> = new Map()
idm220r.set(19/* θ */,_220id0)
idm220r.set(61/* g */,_220id0)
idm220r.set(18/* τ */,_220id0)
idm220r.set(62/* t */,_220id0)
idm220r.set(63/* \ */,_220id0);
const tym220r: Map<number, (L:Lexer)=>void> = new Map()
tym220r.set(4/* nl */,_220id0)
tym220r.set(88,_220id0)
tym220r.set(0/* EOF */,_220id0);
const idm38r: Map<number, (L:Lexer)=>void> = new Map()
idm38r.set(19/* θ */,_38id0)
idm38r.set(61/* g */,_38id0)
idm38r.set(18/* τ */,_38id0)
idm38r.set(62/* t */,_38id0)
idm38r.set(63/* \ */,_38id0);
const tym38r: Map<number, (L:Lexer)=>void> = new Map()
tym38r.set(6/* sym */,_38id0)
tym38r.set(3/* id */,_38id0)
tym38r.set(88,_38id0)
tym38r.set(4/* nl */,_38id0)
tym38r.set(0/* EOF */,_38id0);
const idm199r: Map<number, (L:Lexer)=>void> = new Map()
idm199r.set(19/* θ */,_199id0)
idm199r.set(61/* g */,_199id0)
idm199r.set(18/* τ */,_199id0)
idm199r.set(62/* t */,_199id0)
idm199r.set(63/* \ */,_199id0);
const tym199r: Map<number, (L:Lexer)=>void> = new Map()
tym199r.set(6/* sym */,_199id0)
tym199r.set(3/* id */,_199id0)
tym199r.set(88,_199id0)
tym199r.set(4/* nl */,_199id0)
tym199r.set(0/* EOF */,_199id0);
const tym58r: Map<number, (L:Lexer)=>void> = new Map()
tym58r.set(4/* nl */,_58ty0)
tym58r.set(6/* sym */,_58ty0)
tym58r.set(5/* tok */,_58ty0)
tym58r.set(3/* id */,_58ty0)
tym58r.set(2/* num */,_58ty0)
tym58r.set(1/* ws */,_58ty0)
tym58r.set(7/* key */,_58ty0)
tym58r.set(0/* EOF */,_58ty0);
const tym211r: Map<number, (L:Lexer)=>void> = new Map()
tym211r.set(4/* nl */,_211ty0)
tym211r.set(6/* sym */,_211ty0)
tym211r.set(5/* tok */,_211ty0)
tym211r.set(3/* id */,_211ty0)
tym211r.set(2/* num */,_211ty0)
tym211r.set(1/* ws */,_211ty0)
tym211r.set(7/* key */,_211ty0)
tym211r.set(0/* EOF */,_211ty0);
const idm309: Map<number, (L:Lexer)=>void> = new Map()
idm309.set(19/* θ */,_309id0)
idm309.set(61/* g */,_309id0)
idm309.set(78/* _ */,_309id0)
idm309.set(79/* $ */,_309id0)
idm309.set(18/* τ */,_309id0)
idm309.set(62/* t */,_309id0)
idm309.set(63/* \ */,_309id0)
idm309.set(59/* assert */,_309id0)
idm309.set(60/* shift */,_309id0)
idm309.set(28/* ( */,_309id9)
idm309.set(45/* ↦ */,_309id10)
idm309.set(46/* f */,_309id10)
idm309.set(26/* [ */,_309id12);
const tym309: Map<number, (L:Lexer)=>void> = new Map()
tym309.set(3/* id */,_309id0)
tym309.set(7/* key */,_309id0)
tym309.set(6/* sym */,_309id0)
tym309.set(5/* tok */,_309id0);
const idm245: Map<number, (L:Lexer)=>void> = new Map()
idm245.set(19/* θ */,_245id0)
idm245.set(61/* g */,_245id0)
idm245.set(78/* _ */,_245id0)
idm245.set(79/* $ */,_245id0)
idm245.set(18/* τ */,_245id0)
idm245.set(62/* t */,_245id0)
idm245.set(63/* \ */,_245id0)
idm245.set(59/* assert */,_245id0)
idm245.set(60/* shift */,_245id0)
idm245.set(28/* ( */,_245id0)
idm245.set(45/* ↦ */,_245id0)
idm245.set(46/* f */,_245id0)
idm245.set(26/* [ */,_245id0);
const tym245: Map<number, (L:Lexer)=>void> = new Map()
tym245.set(3/* id */,_245id0)
tym245.set(7/* key */,_245id0)
tym245.set(6/* sym */,_245id0)
tym245.set(5/* tok */,_245id0);
const idm242: Map<number, (L:Lexer)=>void> = new Map()
idm242.set(16/* (+ */,_242id0)
idm242.set(15/* (* */,_242id0)
idm242.set(58/* ? */,_242id2);
const idm242r: Map<number, (L:Lexer)=>void> = new Map()
idm242r.set(45/* ↦ */,const_6_)
idm242r.set(46/* f */,const_6_)
idm242r.set(28/* ( */,const_6_)
idm242r.set(19/* θ */,const_6_)
idm242r.set(61/* g */,const_6_)
idm242r.set(78/* _ */,const_6_)
idm242r.set(79/* $ */,const_6_)
idm242r.set(18/* τ */,const_6_)
idm242r.set(62/* t */,const_6_)
idm242r.set(63/* \ */,const_6_)
idm242r.set(59/* assert */,const_6_)
idm242r.set(60/* shift */,const_6_)
idm242r.set(22/* │ */,const_6_)
idm242r.set(23/* | */,const_6_)
idm242r.set(57/* # */,const_6_)
idm242r.set(30/* ) */,const_6_)
idm242r.set(12/* <> */,const_6_)
idm242r.set(13/* +> */,const_6_)
idm242r.set(27/* ] */,const_6_);
const tym242r: Map<number, (L:Lexer)=>void> = new Map()
tym242r.set(3/* id */,const_6_)
tym242r.set(7/* key */,const_6_)
tym242r.set(6/* sym */,const_6_)
tym242r.set(5/* tok */,const_6_)
tym242r.set(0/* EOF */,const_6_);
const idm310: Map<number, (L:Lexer)=>void> = new Map()
idm310.set(45/* ↦ */,_309id10)
idm310.set(46/* f */,_309id10)
idm310.set(28/* ( */,_310id2)
idm310.set(19/* θ */,_309id0)
idm310.set(61/* g */,_309id0)
idm310.set(78/* _ */,_309id0)
idm310.set(79/* $ */,_309id0)
idm310.set(18/* τ */,_309id0)
idm310.set(62/* t */,_309id0)
idm310.set(63/* \ */,_309id0)
idm310.set(59/* assert */,_309id0)
idm310.set(60/* shift */,_309id0);
const idm324: Map<number, (L:Lexer)=>void> = new Map()
idm324.set(45/* ↦ */,_309id10)
idm324.set(46/* f */,_309id10)
idm324.set(28/* ( */,_310id2)
idm324.set(19/* θ */,_309id0)
idm324.set(61/* g */,_309id0)
idm324.set(78/* _ */,_309id0)
idm324.set(79/* $ */,_309id0)
idm324.set(18/* τ */,_309id0)
idm324.set(62/* t */,_309id0)
idm324.set(63/* \ */,_309id0)
idm324.set(59/* assert */,_309id0)
idm324.set(60/* shift */,_309id0)
idm324.set(27/* ] */,_324id12);
const idm303r: Map<number, (L:Lexer)=>void> = new Map()
idm303r.set(45/* ↦ */,_303id0)
idm303r.set(58/* ? */,_303id0)
idm303r.set(16/* (+ */,_303id0)
idm303r.set(15/* (* */,_303id0)
idm303r.set(46/* f */,_303id0)
idm303r.set(28/* ( */,_303id0)
idm303r.set(19/* θ */,_303id0)
idm303r.set(61/* g */,_303id0)
idm303r.set(78/* _ */,_303id0)
idm303r.set(79/* $ */,_303id0)
idm303r.set(18/* τ */,_303id0)
idm303r.set(62/* t */,_303id0)
idm303r.set(63/* \ */,_303id0)
idm303r.set(59/* assert */,_303id0)
idm303r.set(60/* shift */,_303id0)
idm303r.set(22/* │ */,_303id0)
idm303r.set(23/* | */,_303id0)
idm303r.set(57/* # */,_303id0)
idm303r.set(30/* ) */,_303id0)
idm303r.set(12/* <> */,_303id0)
idm303r.set(13/* +> */,_303id0)
idm303r.set(27/* ] */,_303id0);
const tym303r: Map<number, (L:Lexer)=>void> = new Map()
tym303r.set(3/* id */,_303id0)
tym303r.set(7/* key */,_303id0)
tym303r.set(6/* sym */,_303id0)
tym303r.set(5/* tok */,_303id0)
tym303r.set(0/* EOF */,_303id0);
const idm304: Map<number, (L:Lexer)=>void> = new Map()
idm304.set(19/* θ */,_304id0)
idm304.set(61/* g */,_304id0)
idm304.set(18/* τ */,_304id0)
idm304.set(62/* t */,_304id0)
idm304.set(63/* \ */,_304id0)
idm304.set(59/* assert */,_304id0)
idm304.set(60/* shift */,_304id0)
idm304.set(30/* ) */,_304id7);
const idm321r: Map<number, (L:Lexer)=>void> = new Map()
idm321r.set(45/* ↦ */,_321id0)
idm321r.set(46/* f */,_321id0)
idm321r.set(28/* ( */,_321id0)
idm321r.set(19/* θ */,_321id0)
idm321r.set(61/* g */,_321id0)
idm321r.set(78/* _ */,_321id0)
idm321r.set(79/* $ */,_321id0)
idm321r.set(18/* τ */,_321id0)
idm321r.set(62/* t */,_321id0)
idm321r.set(63/* \ */,_321id0)
idm321r.set(59/* assert */,_321id0)
idm321r.set(60/* shift */,_321id0)
idm321r.set(22/* │ */,_321id0)
idm321r.set(23/* | */,_321id0)
idm321r.set(57/* # */,_321id0)
idm321r.set(30/* ) */,_321id0)
idm321r.set(12/* <> */,_321id0)
idm321r.set(13/* +> */,_321id0)
idm321r.set(27/* ] */,_321id0);
const tym321r: Map<number, (L:Lexer)=>void> = new Map()
tym321r.set(3/* id */,_321id0)
tym321r.set(7/* key */,_321id0)
tym321r.set(6/* sym */,_321id0)
tym321r.set(5/* tok */,_321id0)
tym321r.set(0/* EOF */,_321id0);
const idm363r: Map<number, (L:Lexer)=>void> = new Map()
idm363r.set(45/* ↦ */,_363id0)
idm363r.set(46/* f */,_363id0)
idm363r.set(28/* ( */,_363id0)
idm363r.set(19/* θ */,_363id0)
idm363r.set(61/* g */,_363id0)
idm363r.set(78/* _ */,_363id0)
idm363r.set(79/* $ */,_363id0)
idm363r.set(18/* τ */,_363id0)
idm363r.set(62/* t */,_363id0)
idm363r.set(63/* \ */,_363id0)
idm363r.set(59/* assert */,_363id0)
idm363r.set(60/* shift */,_363id0)
idm363r.set(22/* │ */,_363id0)
idm363r.set(23/* | */,_363id0)
idm363r.set(57/* # */,_363id0)
idm363r.set(30/* ) */,_363id0)
idm363r.set(12/* <> */,_363id0)
idm363r.set(13/* +> */,_363id0)
idm363r.set(27/* ] */,_363id0);
const tym363r: Map<number, (L:Lexer)=>void> = new Map()
tym363r.set(3/* id */,_363id0)
tym363r.set(7/* key */,_363id0)
tym363r.set(6/* sym */,_363id0)
tym363r.set(5/* tok */,_363id0)
tym363r.set(0/* EOF */,_363id0);
const idm341r: Map<number, (L:Lexer)=>void> = new Map()
idm341r.set(45/* ↦ */,_341id0)
idm341r.set(58/* ? */,_341id0)
idm341r.set(16/* (+ */,_341id0)
idm341r.set(15/* (* */,_341id0)
idm341r.set(46/* f */,_341id0)
idm341r.set(28/* ( */,_341id0)
idm341r.set(19/* θ */,_341id0)
idm341r.set(61/* g */,_341id0)
idm341r.set(78/* _ */,_341id0)
idm341r.set(79/* $ */,_341id0)
idm341r.set(18/* τ */,_341id0)
idm341r.set(62/* t */,_341id0)
idm341r.set(63/* \ */,_341id0)
idm341r.set(59/* assert */,_341id0)
idm341r.set(60/* shift */,_341id0)
idm341r.set(22/* │ */,_341id0)
idm341r.set(23/* | */,_341id0)
idm341r.set(57/* # */,_341id0)
idm341r.set(30/* ) */,_341id0)
idm341r.set(12/* <> */,_341id0)
idm341r.set(13/* +> */,_341id0)
idm341r.set(27/* ] */,_341id0);
const tym341r: Map<number, (L:Lexer)=>void> = new Map()
tym341r.set(3/* id */,_341id0)
tym341r.set(7/* key */,_341id0)
tym341r.set(6/* sym */,_341id0)
tym341r.set(5/* tok */,_341id0)
tym341r.set(0/* EOF */,_341id0);
const idm364r: Map<number, (L:Lexer)=>void> = new Map()
idm364r.set(45/* ↦ */,_364id0)
idm364r.set(58/* ? */,_364id0)
idm364r.set(16/* (+ */,_364id0)
idm364r.set(15/* (* */,_364id0)
idm364r.set(46/* f */,_364id0)
idm364r.set(28/* ( */,_364id0)
idm364r.set(19/* θ */,_364id0)
idm364r.set(61/* g */,_364id0)
idm364r.set(78/* _ */,_364id0)
idm364r.set(79/* $ */,_364id0)
idm364r.set(18/* τ */,_364id0)
idm364r.set(62/* t */,_364id0)
idm364r.set(63/* \ */,_364id0)
idm364r.set(59/* assert */,_364id0)
idm364r.set(60/* shift */,_364id0)
idm364r.set(22/* │ */,_364id0)
idm364r.set(23/* | */,_364id0)
idm364r.set(57/* # */,_364id0)
idm364r.set(30/* ) */,_364id0)
idm364r.set(12/* <> */,_364id0)
idm364r.set(13/* +> */,_364id0)
idm364r.set(27/* ] */,_364id0);
const tym364r: Map<number, (L:Lexer)=>void> = new Map()
tym364r.set(3/* id */,_364id0)
tym364r.set(7/* key */,_364id0)
tym364r.set(6/* sym */,_364id0)
tym364r.set(5/* tok */,_364id0)
tym364r.set(0/* EOF */,_364id0);
const idm224: Map<number, (L:Lexer)=>void> = new Map()
idm224.set(78/* _ */,_224id0)
idm224.set(79/* $ */,_224id1);
const tym224: Map<number, (L:Lexer)=>void> = new Map()
tym224.set(3/* id */,_224ty0)
tym224.set(7/* key */,_224ty1);
const idm173r: Map<number, (L:Lexer)=>void> = new Map()
idm173r.set(24/* → */,_173id0)
idm173r.set(78/* _ */,_173id0)
idm173r.set(79/* $ */,_173id0)
idm173r.set(25/* > */,_173id0)
idm173r.set(17/* :: */,_173id0)
idm173r.set(36/* ^ */,_173id0)
idm173r.set(37/* { */,_173id0)
idm173r.set(19/* θ */,_173id0)
idm173r.set(61/* g */,_173id0)
idm173r.set(18/* τ */,_173id0)
idm173r.set(62/* t */,_173id0)
idm173r.set(63/* \ */,_173id0)
idm173r.set(59/* assert */,_173id0)
idm173r.set(60/* shift */,_173id0)
idm173r.set(30/* ) */,_173id0)
idm173r.set(58/* ? */,_173id0)
idm173r.set(16/* (+ */,_173id0)
idm173r.set(15/* (* */,_173id0)
idm173r.set(45/* ↦ */,_173id0)
idm173r.set(46/* f */,_173id0)
idm173r.set(28/* ( */,_173id0)
idm173r.set(27/* ] */,_173id0)
idm173r.set(22/* │ */,_173id0)
idm173r.set(23/* | */,_173id0)
idm173r.set(57/* # */,_173id0)
idm173r.set(12/* <> */,_173id0)
idm173r.set(13/* +> */,_173id0)
idm173r.set(38/* } */,_173id0);
const tym173r: Map<number, (L:Lexer)=>void> = new Map()
tym173r.set(3/* id */,_173id0)
tym173r.set(7/* key */,_173id0)
tym173r.set(2/* num */,_173id0)
tym173r.set(6/* hex */,_173id0)
tym173r.set(6/* bin */,_173id0)
tym173r.set(6/* oct */,_173id0)
tym173r.set(1/* ws */,_173id0)
tym173r.set(6/* sym */,_173id0)
tym173r.set(88,_173id0)
tym173r.set(4/* nl */,_173id0)
tym173r.set(0/* EOF */,_173id0)
tym173r.set(5/* tok */,_173id0)
tym173r.set(6/* sci */,_173id0)
tym173r.set(6/* flt */,_173id0);
const idm296: Map<number, (L:Lexer)=>void> = new Map()
idm296.set(19/* θ */,_296id0)
idm296.set(61/* g */,_296id0)
idm296.set(78/* _ */,_296id2)
idm296.set(79/* $ */,_296id2)
idm296.set(18/* τ */,_296id4)
idm296.set(62/* t */,_296id4)
idm296.set(63/* \ */,_296id6)
idm296.set(59/* assert */,_296id7)
idm296.set(60/* shift */,_296id7)
idm296.set(28/* ( */,_296id9);
const tym296: Map<number, (L:Lexer)=>void> = new Map()
tym296.set(3/* id */,_296id2)
tym296.set(7/* key */,_296id2)
tym296.set(6/* sym */,_296ty2)
tym296.set(5/* tok */,_296ty3);
const idm252r: Map<number, (L:Lexer)=>void> = new Map()
idm252r.set(45/* ↦ */,_252id0)
idm252r.set(58/* ? */,_252id0)
idm252r.set(16/* (+ */,_252id0)
idm252r.set(15/* (* */,_252id0)
idm252r.set(46/* f */,_252id0)
idm252r.set(28/* ( */,_252id0)
idm252r.set(19/* θ */,_252id0)
idm252r.set(61/* g */,_252id0)
idm252r.set(78/* _ */,_252id0)
idm252r.set(79/* $ */,_252id0)
idm252r.set(18/* τ */,_252id0)
idm252r.set(62/* t */,_252id0)
idm252r.set(63/* \ */,_252id0)
idm252r.set(59/* assert */,_252id0)
idm252r.set(60/* shift */,_252id0)
idm252r.set(22/* │ */,_252id0)
idm252r.set(23/* | */,_252id0)
idm252r.set(57/* # */,_252id0)
idm252r.set(30/* ) */,_252id0)
idm252r.set(12/* <> */,_252id0)
idm252r.set(13/* +> */,_252id0)
idm252r.set(27/* ] */,_252id0);
const tym252r: Map<number, (L:Lexer)=>void> = new Map()
tym252r.set(3/* id */,_252id0)
tym252r.set(7/* key */,_252id0)
tym252r.set(6/* sym */,_252id0)
tym252r.set(5/* tok */,_252id0)
tym252r.set(0/* EOF */,_252id0);
const idm253r: Map<number, (L:Lexer)=>void> = new Map()
idm253r.set(45/* ↦ */,_253id0)
idm253r.set(58/* ? */,_253id0)
idm253r.set(16/* (+ */,_253id0)
idm253r.set(15/* (* */,_253id0)
idm253r.set(46/* f */,_253id0)
idm253r.set(28/* ( */,_253id0)
idm253r.set(19/* θ */,_253id0)
idm253r.set(61/* g */,_253id0)
idm253r.set(78/* _ */,_253id0)
idm253r.set(79/* $ */,_253id0)
idm253r.set(18/* τ */,_253id0)
idm253r.set(62/* t */,_253id0)
idm253r.set(63/* \ */,_253id0)
idm253r.set(59/* assert */,_253id0)
idm253r.set(60/* shift */,_253id0)
idm253r.set(22/* │ */,_253id0)
idm253r.set(23/* | */,_253id0)
idm253r.set(57/* # */,_253id0)
idm253r.set(30/* ) */,_253id0)
idm253r.set(12/* <> */,_253id0)
idm253r.set(13/* +> */,_253id0)
idm253r.set(27/* ] */,_253id0);
const tym253r: Map<number, (L:Lexer)=>void> = new Map()
tym253r.set(3/* id */,_253id0)
tym253r.set(7/* key */,_253id0)
tym253r.set(6/* sym */,_253id0)
tym253r.set(5/* tok */,_253id0)
tym253r.set(0/* EOF */,_253id0);
const idm239: Map<number, (L:Lexer)=>void> = new Map()
idm239.set(45/* ↦ */,_239id0)
idm239.set(46/* f */,_239id0)
idm239.set(28/* ( */,_310id2)
idm239.set(19/* θ */,_309id0)
idm239.set(61/* g */,_309id0)
idm239.set(78/* _ */,_309id0)
idm239.set(79/* $ */,_309id0)
idm239.set(18/* τ */,_309id0)
idm239.set(62/* t */,_309id0)
idm239.set(63/* \ */,_309id0)
idm239.set(59/* assert */,_309id0)
idm239.set(60/* shift */,_309id0);
const idm239r: Map<number, (L:Lexer)=>void> = new Map()
idm239r.set(45/* ↦ */,const_9_)
idm239r.set(46/* f */,const_9_)
idm239r.set(22/* │ */,const_9_)
idm239r.set(23/* | */,const_9_)
idm239r.set(57/* # */,const_9_)
idm239r.set(30/* ) */,const_9_)
idm239r.set(12/* <> */,const_9_)
idm239r.set(13/* +> */,const_9_);
const tym239r: Map<number, (L:Lexer)=>void> = new Map()
tym239r.set(0/* EOF */,const_9_);
const idm237r: Map<number, (L:Lexer)=>void> = new Map()
idm237r.set(22/* │ */,_237id0)
idm237r.set(23/* | */,_237id0)
idm237r.set(57/* # */,_237id0)
idm237r.set(30/* ) */,_237id0)
idm237r.set(12/* <> */,_237id0)
idm237r.set(13/* +> */,_237id0)
idm237r.set(45/* ↦ */,_237id0)
idm237r.set(46/* f */,_237id0);
const tym237r: Map<number, (L:Lexer)=>void> = new Map()
tym237r.set(0/* EOF */,_237id0);
const idm334: Map<number, (L:Lexer)=>void> = new Map()
idm334.set(22/* │ */,_342id0)
idm334.set(23/* | */,_342id0)
idm334.set(57/* # */,_3id2)
idm334.set(30/* ) */,_334id3);
const idm318r: Map<number, (L:Lexer)=>void> = new Map()
idm318r.set(22/* │ */,_318id0)
idm318r.set(23/* | */,_318id0)
idm318r.set(57/* # */,_318id0)
idm318r.set(30/* ) */,_318id0)
idm318r.set(12/* <> */,_318id0)
idm318r.set(13/* +> */,_318id0)
idm318r.set(45/* ↦ */,_318id0)
idm318r.set(46/* f */,_318id0);
const tym318r: Map<number, (L:Lexer)=>void> = new Map()
tym318r.set(0/* EOF */,_318id0);
const idm75r: Map<number, (L:Lexer)=>void> = new Map()
idm75r.set(30/* ) */,_75id0)
idm75r.set(19/* θ */,_75id0)
idm75r.set(61/* g */,_75id0)
idm75r.set(18/* τ */,_75id0)
idm75r.set(62/* t */,_75id0)
idm75r.set(63/* \ */,_75id0)
idm75r.set(59/* assert */,_75id0)
idm75r.set(60/* shift */,_75id0);
const tym75r: Map<number, (L:Lexer)=>void> = new Map()
tym75r.set(88,_75id0)
tym75r.set(0/* EOF */,_75id0);
const idm217r: Map<number, (L:Lexer)=>void> = new Map()
idm217r.set(30/* ) */,_217id0)
idm217r.set(19/* θ */,_217id0)
idm217r.set(61/* g */,_217id0)
idm217r.set(18/* τ */,_217id0)
idm217r.set(62/* t */,_217id0)
idm217r.set(63/* \ */,_217id0)
idm217r.set(59/* assert */,_217id0)
idm217r.set(60/* shift */,_217id0);
const tym217r: Map<number, (L:Lexer)=>void> = new Map()
tym217r.set(88,_217id0)
tym217r.set(0/* EOF */,_217id0);
function $hydrocarbon(l:Lexer) :void{//Production Start
/*
hydrocarbon=>• head
head=>• pre$preamble prd$productions
head=>• prd$productions
pre$preamble=>• pre$preamble pre$preamble_clause
pre$preamble=>• pre$preamble_clause
pre$preamble_clause=>• pre$ignore_preamble
pre$preamble_clause=>• pre$symbols_preamble
pre$preamble_clause=>• pre$precedence_preamble
pre$preamble_clause=>• pre$name_preamble
pre$preamble_clause=>• pre$ext_preamble
pre$preamble_clause=>• pre$error_preamble
pre$preamble_clause=>• pre$import_preamble
pre$preamble_clause=>• cm$comment
pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
pre$name_preamble=>• @ τNAME sym$identifier θnl
pre$ext_preamble=>• @ τEXT sym$identifier θnl
pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
cm$comment=>• cm$cm
cm$cm=>• # cm$comment_data cm$comment_delimiter
prd$productions=>• prd$production
prd$productions=>• fn$referenced_function
prd$productions=>• prd$productions prd$production
prd$productions=>• prd$productions cm$comment
prd$productions=>• prd$productions fn$referenced_function
prd$productions=>•
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
//considered syms: @,#,END_OF_ITEM,<>,+>,↦,f

//Single Production Completion

//peek 0

//block 0

//groups false
/*
hydrocarbon=>• head
*/
$head(l)
if(!FAILED){
setProduction(0)
add_reduce(1,1);
return;
}
fail(l);}
    function $head(l:Lexer) :void{//Production Start
/*
head=>• pre$preamble prd$productions
head=>• prd$productions
pre$preamble=>• pre$preamble pre$preamble_clause
pre$preamble=>• pre$preamble_clause
pre$preamble_clause=>• pre$ignore_preamble
pre$preamble_clause=>• pre$symbols_preamble
pre$preamble_clause=>• pre$precedence_preamble
pre$preamble_clause=>• pre$name_preamble
pre$preamble_clause=>• pre$ext_preamble
pre$preamble_clause=>• pre$error_preamble
pre$preamble_clause=>• pre$import_preamble
pre$preamble_clause=>• cm$comment
pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
pre$name_preamble=>• @ τNAME sym$identifier θnl
pre$ext_preamble=>• @ τEXT sym$identifier θnl
pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
cm$comment=>• cm$cm
cm$cm=>• # cm$comment_data cm$comment_delimiter
prd$productions=>• prd$production
prd$productions=>• fn$referenced_function
prd$productions=>• prd$productions prd$production
prd$productions=>• prd$productions cm$comment
prd$productions=>• prd$productions fn$referenced_function
prd$productions=>•
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
if(l.id == 47/* @ */||l.id == 57/* # */){
 //considered syms: @,#

//Single Production Completion

//peek 0

//block 1

//groups true
/*
head=>• pre$preamble prd$productions
*/
$pre$preamble(l)
if(!FAILED){
$prd$productions(l)
if(!FAILED){
setProduction(1)
add_reduce(2,2);
return;
}
}
} else if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */){
 //considered syms: END_OF_ITEM,<>,+>,↦,f

//Single Production Completion

//peek 0

//block 1

//groups true
/*
head=>• prd$productions
*/
$prd$productions(l)
if(!FAILED){
setProduction(1)
add_reduce(1,3);
return;
}
}
fail(l);}
    
    function $prd$production_group_08_100(l:Lexer) :void{//Production Start
/*
prd$production_group_08_100=>• sym$production_id
sym$production_id=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
prd$production_group_08_100=>• sym$production_id
*/
$sym$production_id(l)
if(!FAILED){
setProduction(4)
add_reduce(1,8);
return;
}
fail(l);}
    function $prd$production_group_010_101(l:Lexer) :void{//Production Start
/*
prd$production_group_010_101=>• │
prd$production_group_010_101=>• |
*/
_skip(l, const__)
if(l.id == 22/* │ */){
 //considered syms: │

//Single Production Completion

//peek 0

//block 1

//groups true
/*
prd$production_group_010_101=>• │
*/
_no_check(l);
if(!FAILED){
setProduction(5)

return;
}
} else if(l.id == 23/* | */){
 //considered syms: |

//Single Production Completion

//peek 0

//block 1

//groups true
/*
prd$production_group_010_101=>• |
*/
_no_check(l);
if(!FAILED){
setProduction(5)

return;
}
}
fail(l);}
    function $prd$production_group_111_102(l:Lexer) :void{//Production Start
/*
prd$production_group_111_102=>• prd$production_group_010_101 fn$error_function
prd$production_group_010_101=>• │
prd$production_group_010_101=>• |
*/
_skip(l, const__)
//considered syms: │,|

//Single Production Completion

//peek 0

//block 0

//groups false
/*
prd$production_group_111_102=>• prd$production_group_010_101 fn$error_function
*/
$prd$production_group_010_101(l)
if(!FAILED){
$fn$error_function(l)
if(!FAILED){
setProduction(6)
add_reduce(2,0);
return;
}
}
fail(l);}
    function $prd$production_group_013_103(l:Lexer) :void{//Production Start
/*
prd$production_group_013_103=>• sym$imported_production_symbol
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
sym$production_id=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
prd$production_group_013_103=>• sym$imported_production_symbol
*/
$sym$imported_production_symbol(l)
if(!FAILED){
setProduction(7)
add_reduce(1,8);
return;
}
fail(l);}
    
    function $prd$production_start_symbol(l:Lexer) :void{//Production Start
/*
prd$production_start_symbol=>• →
prd$production_start_symbol=>• >
*/
_skip(l, const__)
if(l.id == 24/* → */){
 //considered syms: →

//Single Production Completion

//peek 0

//block 1

//groups true
/*
prd$production_start_symbol=>• →
*/
_no_check(l);
if(!FAILED){
setProduction(9)

return;
}
} else if(l.id == 25/* > */){
 //considered syms: >

//Single Production Completion

//peek 0

//block 1

//groups true
/*
prd$production_start_symbol=>• >
*/
_no_check(l);
if(!FAILED){
setProduction(9)

return;
}
}
fail(l);}
    function $pb$production_bodies_group_04_100(l:Lexer) :void{//Production Start
/*
pb$production_bodies_group_04_100=>• │
pb$production_bodies_group_04_100=>• |
*/
_skip(l, const__)
if(l.id == 22/* │ */){
 //considered syms: │

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$production_bodies_group_04_100=>• │
*/
_no_check(l);
if(!FAILED){
setProduction(11)

return;
}
} else if(l.id == 23/* | */){
 //considered syms: |

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$production_bodies_group_04_100=>• |
*/
_no_check(l);
if(!FAILED){
setProduction(11)

return;
}
}
fail(l);}
    
    function $pb$production_body(l:Lexer) :void{//Production Start
/*
pb$production_body=>• pb$force_fork pb$entries
pb$production_body=>• pb$entries
pb$force_fork=>• ( τFORK )
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• sym$empty_symbol
pb$entries=>• sym$EOF_symbol
pb$entries=>• pb$body_entries
pb$body_entries=>• sym$symbol
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$production_symbol=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
sym$production_id=>• sym$identifier
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(l.id == 28/* ( */){
 //considered syms: (

//Look Ahead Level 1
/*
pb$production_body=>• pb$force_fork pb$entries
pb$production_body=>• pb$entries
*/
const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
/*pb$production_body=>• pb$force_fork pb$entries peek 1 state: 
pb$force_fork=>( • τFORK )*/

/*pb$production_body=>• pb$entries peek 1 state: 
sym$generated_symbol_group_141_106=>τg • :
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
sym$imported_production_symbol=>sym$production_id • :: sym$identifier
sym$literal_symbol_group_144_107=>τt • :
def$natural=>• θnum
sym$escaped_symbol_group_050_109=>• θid
sym$escaped_symbol_group_050_109=>• θtok
sym$escaped_symbol_group_050_109=>• θsym
sym$assert_function_symbol=>τassert • : sym$identifier
sym$assert_function_symbol=>τshift • : sym$identifier
pb$force_fork=>• ( τFORK )
pb$body_entries=>• [ pb$body_entries ]
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof
pb$condition_clause=>( • τEXC sym$condition_symbol_list )
pb$condition_clause=>( • τERR sym$condition_symbol_list )
pb$condition_clause=>( • τIGN sym$condition_symbol_list )
pb$condition_clause=>( • τRST sym$condition_symbol_list )
pb$condition_clause=>( • τRED sym$symbol )
fn$js_function_start_symbol=>τf • :
fn$function_clause=>fn$js_function_start_symbol • { fn$js_data }*/

/*pb$production_body=>• pb$entries peek 1 state: 
pb$production_body=>• pb$entries
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• sym$empty_symbol
pb$entries=>• sym$EOF_symbol
pb$entries=>• pb$body_entries
pb$body_entries=>• sym$symbol
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$production_symbol=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
sym$production_id=>• sym$identifier
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof*/

if(!FAILED &&  pk1.id == 29/* FORK */){
 //considered syms: FORK

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pb$production_body=>• pb$force_fork pb$entries
*/
$pb$force_fork(l)
if(!FAILED){
$pb$entries(l)
if(!FAILED){
setProduction(13)
add_reduce(2,15);
return;
}
}
} else if(!FAILED &&  const_0_.includes(pk1.id)||pk1.ty == 2/* num */||pk1.ty == 3/* id */||pk1.ty == 5/* tok */||pk1.ty == 6/* sym */||pk1.ty == 7/* key */){
 //considered syms: :,_,$,id,key,::,num,tok,sym,(,[,θ,g,τ,t,\,assert,shift,↦,f,ɛ,$eof,EXC,ERR,IGN,RST,RED,{

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pb$production_body=>• pb$entries
*/
$pb$entries(l)
if(!FAILED){
setProduction(13)
add_reduce(1,16);
return;
}
}
} else if(const_3_.includes(l.id)||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){
 //considered syms: [,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,↦,f,ɛ,$eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$production_body=>• pb$entries
*/
$pb$entries(l)
if(!FAILED){
setProduction(13)
add_reduce(1,16);
return;
}
}
fail(l);}
    function $pb$entries(l:Lexer) :void{//Production Start
/*
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• sym$empty_symbol
pb$entries=>• sym$EOF_symbol
pb$entries=>• pb$body_entries
pb$body_entries=>• sym$symbol
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$production_symbol=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
sym$production_id=>• sym$identifier
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(const_1_.includes(l.id)||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){
 //considered syms: [,(,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,↦,f

//Parallel Transition
/*
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• pb$body_entries
*/
$pb$body_entries(l)

//Look Ahead Level 0
/*
pb$entries=>pb$body_entries • fn$reduce_function
*/
_skip(l, const__)
if(l.id == 45/* ↦ */||l.id == 46/* f */){
 //considered syms: ↦,f

//Single Production Completion

//peek 0

//block 3

//groups true
/*
pb$entries=>pb$body_entries • fn$reduce_function
*/
$fn$reduce_function(l)
if(!FAILED){
setProduction(14)
add_reduce(2,17);
return;
}
} else {
 //considered syms: END_OF_ITEM

//Single Production Completion

//peek 0

//block 3

//groups true
/*
pb$entries=>pb$body_entries •
*/
if(!FAILED){
setProduction(14)
add_reduce(1,20);
return;
}
}
} else if(l.id == 20/* ɛ */){
 //considered syms: ɛ

//Single Production Completion

//peek -1

//block 1

//groups true
/*
pb$entries=>• sym$empty_symbol
*/
$sym$empty_symbol(l)
if(!FAILED){
setProduction(14)
add_reduce(1,18);
return;
}
} else if(l.id == 21/* $eof */){
 //considered syms: $eof

//Single Production Completion

//peek -1

//block 1

//groups true
/*
pb$entries=>• sym$EOF_symbol
*/
$sym$EOF_symbol(l)
if(!FAILED){
setProduction(14)
add_reduce(1,19);
return;
}
}
fail(l);}
    
    function $pb$force_fork(l:Lexer) :void{//Production Start
/*
pb$force_fork=>• ( τFORK )
*/
_skip(l, const__)
//considered syms: (

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pb$force_fork=>• ( τFORK )
*/
_with_skip(l, const__, 28/* ( */);
if(!FAILED){
_with_skip(l, const__, 29/* FORK */);
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(16)
add_reduce(3,24);
return;
}
}
}
fail(l);}
    function $pb$condition_clause(l:Lexer) :void{//Production Start
/*
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
*/
_skip(l, const__)
//considered syms: (

//Parallel Transition
/*
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
*/
_no_check(l);

//Look Ahead Level 0
/*

*/
_skip(l, const__)
if(l.id == 31/* EXC */){
 //considered syms: EXC

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pb$condition_clause=>( • τEXC sym$condition_symbol_list )
*/
_no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(17)
add_reduce(4,25);
return;
}
}
}
} else if(l.id == 32/* ERR */){
 //considered syms: ERR

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pb$condition_clause=>( • τERR sym$condition_symbol_list )
*/
_no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(17)
add_reduce(4,26);
return;
}
}
}
} else if(l.id == 33/* IGN */){
 //considered syms: IGN

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pb$condition_clause=>( • τIGN sym$condition_symbol_list )
*/
_no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(17)
add_reduce(4,27);
return;
}
}
}
} else if(l.id == 34/* RST */){
 //considered syms: RST

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pb$condition_clause=>( • τRST sym$condition_symbol_list )
*/
_no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(17)
add_reduce(4,28);
return;
}
}
}
} else if(l.id == 35/* RED */){
 //considered syms: RED

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pb$condition_clause=>( • τRED sym$symbol )
*/
_no_check(l);
if(!FAILED){
$sym$symbol(l)
if(!FAILED){
_with_skip(l, const__, 30/* ) */);
if(!FAILED){
setProduction(17)
add_reduce(4,29);
return;
}
}
}
}
fail(l);}
    function $fn$referenced_function(l:Lexer) :void{//Production Start
/*
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
//considered syms: ↦,f

//Parallel Transition
/*
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
*/
$fn$js_function_start_symbol(l)

//Parallel Transition
/*
fn$referenced_function=>fn$js_function_start_symbol • sym$identifier ^ sym$js_identifier
fn$referenced_function=>fn$js_function_start_symbol • sym$identifier { fn$js_data }
*/
$sym$identifier(l)

//Look Ahead Level 0
/*

*/
_skip(l, const__)
if(l.id == 36/* ^ */){
 //considered syms: ^

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$referenced_function=>fn$js_function_start_symbol sym$identifier • ^ sym$js_identifier
*/
_no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(18)
add_reduce(4,30);
return;
}
}
} else if(l.id == 37/* { */){
 //considered syms: {

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$referenced_function=>fn$js_function_start_symbol sym$identifier • { fn$js_data }
*/
_no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 38/* } */);
if(!FAILED){
setProduction(18)
add_reduce(5,31);
return;
}
}
}
}
fail(l);}
    function $fn$error_function(l:Lexer) :void{//Production Start
/*
fn$error_function=>• τerh : { fn$js_data } { fn$js_data }
*/
_skip(l, const__)
//considered syms: erh

//Single Production Completion

//peek 0

//block 0

//groups false
/*
fn$error_function=>• τerh : { fn$js_data } { fn$js_data }
*/
_with_skip(l, const__, 39/* erh */);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
_with_skip(l, const_2_, 37/* { */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 38/* } */);
if(!FAILED){
_with_skip(l, const_2_, 37/* { */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 38/* } */);
if(!FAILED){
setProduction(19)
add_reduce(8,32);
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
    function $fn$reduce_function_group_07_100(l:Lexer) :void{//Production Start
/*
fn$reduce_function_group_07_100=>• τcstr
fn$reduce_function_group_07_100=>• τc
fn$reduce_function_group_07_100=>• τreturn
fn$reduce_function_group_07_100=>• τr
*/
_skip(l, const__)
if(l.id == 41/* cstr */){
 //considered syms: cstr

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$reduce_function_group_07_100=>• τcstr
*/
_no_check(l);
if(!FAILED){
setProduction(20)

return;
}
} else if(l.id == 42/* c */){
 //considered syms: c

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$reduce_function_group_07_100=>• τc
*/
_no_check(l);
if(!FAILED){
setProduction(20)

return;
}
} else if(l.id == 43/* return */){
 //considered syms: return

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$reduce_function_group_07_100=>• τreturn
*/
_no_check(l);
if(!FAILED){
setProduction(20)

return;
}
} else if(l.id == 44/* r */){
 //considered syms: r

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$reduce_function_group_07_100=>• τr
*/
_no_check(l);
if(!FAILED){
setProduction(20)

return;
}
}
fail(l);}
    function $fn$reduce_function(l:Lexer) :void{//Production Start
/*
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 { fn$js_data }
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 ^ sym$js_identifier
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 => sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
//considered syms: ↦,f

//Parallel Transition
/*
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 { fn$js_data }
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 ^ sym$js_identifier
fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 => sym$js_identifier
*/
$fn$js_function_start_symbol(l)

//Parallel Transition
/*
fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 { fn$js_data }
fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 ^ sym$js_identifier
fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 => sym$js_identifier
*/
$fn$reduce_function_group_07_100(l)

//Look Ahead Level 0
/*

*/
_skip(l, const__)
if(l.id == 37/* { */){
 //considered syms: {

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • { fn$js_data }
*/
_no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 38/* } */);
if(!FAILED){
setProduction(21)
add_reduce(5,33);
return;
}
}
}
} else if(l.id == 36/* ^ */){
 //considered syms: ^

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • ^ sym$js_identifier
*/
_no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(21)
add_reduce(4,34);
return;
}
}
} else if(l.id == 14/* => */){
 //considered syms: =>

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • => sym$js_identifier
*/
_no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(21)
add_reduce(4,35);
return;
}
}
}
fail(l);}
    function $fn$function_clause(l:Lexer) :void{//Production Start
/*
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
//considered syms: ↦,f

//Parallel Transition
/*
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
*/
$fn$js_function_start_symbol(l)

//Look Ahead Level 0
/*

*/
_skip(l, const__)
if(l.id == 37/* { */){
 //considered syms: {

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$function_clause=>fn$js_function_start_symbol • { fn$js_data }
*/
_no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 38/* } */);
if(!FAILED){
setProduction(22)
add_reduce(4,36);
return;
}
}
}
} else if(l.id == 36/* ^ */){
 //considered syms: ^

//Single Production Completion

//peek 0

//block 2

//groups true
/*
fn$function_clause=>fn$js_function_start_symbol • ^ sym$js_identifier
*/
_no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(22)
add_reduce(3,37);
return;
}
}
}
fail(l);}
    
    function $fn$js_primitive_group_033_101(l:Lexer) :void{//Production Start
/*
fn$js_primitive_group_033_101=>• sym$terminal_symbol
fn$js_primitive_group_033_101=>• sym$EOF_symbol
sym$terminal_symbol=>• sym$generated_symbol
sym$terminal_symbol=>• sym$literal_symbol
sym$terminal_symbol=>• sym$escaped_symbol
sym$terminal_symbol=>• sym$assert_function_symbol
sym$terminal_symbol=>• θany
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(!(false )){
 //considered syms: any,θ,g,τ,t,\,assert,shift

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_033_101=>• sym$terminal_symbol
*/
$sym$terminal_symbol(l)
if(!FAILED){
setProduction(24)

return;
}
} else if(l.id == 21/* $eof */){
 //considered syms: $eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_033_101=>• sym$EOF_symbol
*/
$sym$EOF_symbol(l)
if(!FAILED){
setProduction(24)

return;
}
}
fail(l);}
    function $fn$js_primitive(l:Lexer) :void{//Production Start
/*
fn$js_primitive=>• θid
fn$js_primitive=>• θnum
fn$js_primitive=>• θws
fn$js_primitive=>• θsym
fn$js_primitive=>• θtok
fn$js_primitive=>• θkey
fn$js_primitive=>• fn$js_primitive_group_033_101
fn$js_primitive_group_033_101=>• sym$terminal_symbol
fn$js_primitive_group_033_101=>• sym$EOF_symbol
sym$terminal_symbol=>• sym$generated_symbol
sym$terminal_symbol=>• sym$literal_symbol
sym$terminal_symbol=>• sym$escaped_symbol
sym$terminal_symbol=>• sym$assert_function_symbol
sym$terminal_symbol=>• θany
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$EOF_symbol=>• $eof
*/
_skip(l, const_2_)
if(l.ty == 3/* id */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.ty == 2/* num */){
 //considered syms: num

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θnum
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.ty == 1/* ws */){
 //considered syms: ws

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θws
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.ty == 6/* sym */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.ty == 5/* tok */){
 //considered syms: tok

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θtok
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(l.ty == 7/* key */){
 //considered syms: key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• θkey
*/
_no_check(l);
if(!FAILED){
setProduction(25)

return;
}
} else if(!(false )){
 //considered syms: any,θ,g,τ,t,\,assert,shift,$eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• fn$js_primitive_group_033_101
*/
$fn$js_primitive_group_033_101(l)
if(!FAILED){
setProduction(25)
add_reduce(1,39);
return;
}
}
fail(l);}
    function $fn$js_data_block(l:Lexer) :void{//Production Start
/*
fn$js_data_block=>• { fn$js_data }
*/
_skip(l, const__)
//considered syms: {

//Single Production Completion

//peek 0

//block 0

//groups false
/*
fn$js_data_block=>• { fn$js_data }
*/
_with_skip(l, const_2_, 37/* { */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const_2_, 38/* } */);
if(!FAILED){
setProduction(26)
add_reduce(3,40);
return;
}
}
}
fail(l);}
    function $fn$js_function_start_symbol(l:Lexer) :void{//Production Start
/*
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
*/
_skip(l, const__)
if(l.id == 45/* ↦ */){
 //considered syms: ↦

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_function_start_symbol=>• ↦
*/
_no_check(l);
if(!FAILED){
setProduction(27)

return;
}
} else if(l.id == 46/* f */){
 //considered syms: f

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_function_start_symbol=>• τf :
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
setProduction(27)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    
    function $pre$preamble_clause(l:Lexer) :void{//Production Start
/*
pre$preamble_clause=>• pre$ignore_preamble
pre$preamble_clause=>• pre$symbols_preamble
pre$preamble_clause=>• pre$precedence_preamble
pre$preamble_clause=>• pre$name_preamble
pre$preamble_clause=>• pre$ext_preamble
pre$preamble_clause=>• pre$error_preamble
pre$preamble_clause=>• pre$import_preamble
pre$preamble_clause=>• cm$comment
pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
pre$name_preamble=>• @ τNAME sym$identifier θnl
pre$ext_preamble=>• @ τEXT sym$identifier θnl
pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
cm$comment=>• cm$cm
cm$cm=>• # cm$comment_data cm$comment_delimiter
*/
_skip(l, const__)
if(l.id == 47/* @ */){
 //considered syms: @

//Look Ahead Level 1
/*
pre$preamble_clause=>• pre$ignore_preamble
pre$preamble_clause=>• pre$symbols_preamble
pre$preamble_clause=>• pre$precedence_preamble
pre$preamble_clause=>• pre$name_preamble
pre$preamble_clause=>• pre$ext_preamble
pre$preamble_clause=>• pre$error_preamble
pre$preamble_clause=>• pre$import_preamble
*/
const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
/*pre$preamble_clause=>• pre$ignore_preamble peek 1 state: 
pre$ignore_preamble=>@ • τIGNORE sym$ignore_symbols θnl*/

/*pre$preamble_clause=>• pre$symbols_preamble peek 1 state: 
pre$symbols_preamble=>@ • τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl*/

/*pre$preamble_clause=>• pre$precedence_preamble peek 1 state: 
pre$precedence_preamble=>@ • τPREC sym$terminal_symbol θnum θnl*/

/*pre$preamble_clause=>• pre$name_preamble peek 1 state: 
pre$name_preamble=>@ • τNAME sym$identifier θnl*/

/*pre$preamble_clause=>• pre$ext_preamble peek 1 state: 
pre$ext_preamble=>@ • τEXT sym$identifier θnl*/

/*pre$preamble_clause=>• pre$error_preamble peek 1 state: 
pre$error_preamble=>@ • τERROR sym$ignore_symbols θnl*/

/*pre$preamble_clause=>• pre$import_preamble peek 1 state: 
pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl*/

if(!FAILED &&  pk1.id == 50/* IGNORE */){
 //considered syms: IGNORE

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$ignore_preamble
*/
$pre$ignore_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 48/* SYMBOL */){
 //considered syms: SYMBOL

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$symbols_preamble
*/
$pre$symbols_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 49/* PREC */){
 //considered syms: PREC

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$precedence_preamble
*/
$pre$precedence_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 52/* NAME */){
 //considered syms: NAME

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$name_preamble
*/
$pre$name_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 53/* EXT */){
 //considered syms: EXT

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$ext_preamble
*/
$pre$ext_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 51/* ERROR */){
 //considered syms: ERROR

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$error_preamble
*/
$pre$error_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
} else if(!FAILED &&  pk1.id == 56/* IMPORT */){
 //considered syms: IMPORT

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pre$preamble_clause=>• pre$import_preamble
*/
$pre$import_preamble(l)
if(!FAILED){
setProduction(30)

return;
}
}
} else if(l.id == 57/* # */){
 //considered syms: #

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$preamble_clause=>• cm$comment
*/
$cm$comment(l)
if(!FAILED){
setProduction(30)

return;
}
}
fail(l);}
    
    function $pre$symbols_preamble(l:Lexer) :void{//Production Start
/*
pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 48/* SYMBOL */);
if(!FAILED){
$pre$symbols_preamble_HC_listbody2_101(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(32)
add_reduce(4,43);
return;
}
}
}
}
fail(l);}
    function $pre$precedence_preamble(l:Lexer) :void{//Production Start
/*
pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 49/* PREC */);
if(!FAILED){
$sym$terminal_symbol(l)
if(!FAILED){
_with_skip(l, const_4_, 2/* num */);
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(33)
add_reduce(5,44);
return;
}
}
}
}
}
fail(l);}
    function $pre$ignore_preamble(l:Lexer) :void{//Production Start
/*
pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 50/* IGNORE */);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(34)
add_reduce(4,45);
return;
}
}
}
}
fail(l);}
    function $pre$error_preamble(l:Lexer) :void{//Production Start
/*
pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 51/* ERROR */);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(35)
add_reduce(4,46);
return;
}
}
}
}
fail(l);}
    function $pre$name_preamble(l:Lexer) :void{//Production Start
/*
pre$name_preamble=>• @ τNAME sym$identifier θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$name_preamble=>• @ τNAME sym$identifier θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 52/* NAME */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(36)
add_reduce(4,47);
return;
}
}
}
}
fail(l);}
    function $pre$ext_preamble(l:Lexer) :void{//Production Start
/*
pre$ext_preamble=>• @ τEXT sym$identifier θnl
*/
_skip(l, const__)
//considered syms: @

//Single Production Completion

//peek 0

//block 0

//groups false
/*
pre$ext_preamble=>• @ τEXT sym$identifier θnl
*/
_with_skip(l, const__, 47/* @ */);
if(!FAILED){
_with_skip(l, const__, 53/* EXT */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(37)
add_reduce(4,48);
return;
}
}
}
}
fail(l);}
    
    function $pre$import_preamble_group_019_103(l:Lexer) :void{//Production Start
/*
pre$import_preamble_group_019_103=>• θid
pre$import_preamble_group_019_103=>• θkey
pre$import_preamble_group_019_103=>• θsym
pre$import_preamble_group_019_103=>• θtok
*/
_skip(l, const__)
if(l.ty == 3/* id */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_019_103=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(39)

return;
}
} else if(l.ty == 7/* key */){
 //considered syms: key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_019_103=>• θkey
*/
_no_check(l);
if(!FAILED){
setProduction(39)

return;
}
} else if(l.ty == 6/* sym */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_019_103=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(39)

return;
}
} else if(l.ty == 5/* tok */){
 //considered syms: tok

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_019_103=>• θtok
*/
_no_check(l);
if(!FAILED){
setProduction(39)

return;
}
}
fail(l);}
    
    
    function $pre$import_preamble_group_021_106(l:Lexer) :void{//Production Start
/*
pre$import_preamble_group_021_106=>• τAS
pre$import_preamble_group_021_106=>• τas
*/
_skip(l, const__)
if(l.id == 54/* AS */){
 //considered syms: AS

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_021_106=>• τAS
*/
_no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.id == 55/* as */){
 //considered syms: as

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pre$import_preamble_group_021_106=>• τas
*/
_no_check(l);
if(!FAILED){
setProduction(42)

return;
}
}
fail(l);}
    function $pre$import_preamble(l:Lexer) :void{//Production Start
/*
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
_skip(l, const__)
//considered syms: @

//Parallel Transition
/*
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
_no_check(l);

//Parallel Transition
/*
pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
_with_skip(l, const_2_, 56/* IMPORT */);

//Look Ahead Level 0
/*
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
_skip(l, const_2_)
if(l.ty == 1/* ws */){
 //considered syms: ws

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
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
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(43)
add_reduce(8,50);
return;
}
}
}
}
}
}
} else if(l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){
 //considered syms: id,key,sym,tok

//Single Production Completion

//peek 0

//block 2

//groups true
/*
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
$pre$import_preamble_HC_listbody1_104(l)
if(!FAILED){
$pre$import_preamble_HC_listbody4_105(l)
if(!FAILED){
$pre$import_preamble_group_021_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(43)
add_reduce(7,50);
return;
}
}
}
}
}
}
fail(l);}
    function $cm$comment(l:Lexer) :void{//Production Start
/*
cm$comment=>• cm$cm
cm$cm=>• # cm$comment_data cm$comment_delimiter
*/
_skip(l, const__)
//considered syms: #

//Single Production Completion

//peek 0

//block 0

//groups false
/*
cm$comment=>• cm$cm
*/
$cm$cm(l)
if(!FAILED){
setProduction(44)

return;
}
fail(l);}
    function $cm$cm(l:Lexer) :void{//Production Start
/*
cm$cm=>• # cm$comment_data cm$comment_delimiter
*/
_skip(l, const__)
//considered syms: #

//Single Production Completion

//peek 0

//block 0

//groups false
/*
cm$cm=>• # cm$comment_data cm$comment_delimiter
*/
_with_skip(l, const_2_, 57/* # */);
if(!FAILED){
$cm$comment_data(l)
if(!FAILED){
$cm$comment_delimiter(l)
if(!FAILED){
setProduction(45)
add_reduce(3,51);
return;
}
}
}
fail(l);}
    function $cm$comment_delimiter(l:Lexer) :void{//Production Start
/*
cm$comment_delimiter=>• θnl
*/
_skip(l, const_4_)
//considered syms: nl

//Single Production Completion

//peek 0

//block 0

//groups false
/*
cm$comment_delimiter=>• θnl
*/
_with_skip(l, const__, 4/* nl */);
if(!FAILED){
setProduction(46)

return;
}
fail(l);}
    
    function $cm$comment_primitive(l:Lexer) :void{//Production Start
/*
cm$comment_primitive=>• θsym
cm$comment_primitive=>• θtok
cm$comment_primitive=>• θid
cm$comment_primitive=>• θnum
cm$comment_primitive=>• θws
cm$comment_primitive=>• θkey
*/
_skip(l, const_2_)
if(l.ty == 6/* sym */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 5/* tok */){
 //considered syms: tok

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θtok
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 3/* id */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 2/* num */){
 //considered syms: num

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θnum
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 1/* ws */){
 //considered syms: ws

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θws
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
} else if(l.ty == 7/* key */){
 //considered syms: key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
cm$comment_primitive=>• θkey
*/
_no_check(l);
if(!FAILED){
setProduction(48)

return;
}
}
fail(l);}
    
    
    function $sym$lexer_symbol(l:Lexer) :void{//Production Start
/*
sym$lexer_symbol=>• sym$generated_symbol
sym$lexer_symbol=>• sym$literal_symbol
sym$lexer_symbol=>• sym$escaped_symbol
sym$lexer_symbol=>• sym$grouped_symbol sym$grouped_delimiter
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$grouped_symbol=>• sym$grouped_symbol sym$grouped_symbol_group_012_103
sym$grouped_symbol=>• sym$grouped_symbol_group_012_103
sym$grouped_symbol_group_012_103=>• θsym
sym$grouped_symbol_group_012_103=>• θid
sym$grouped_symbol_group_012_103=>• θany
*/
_skip(l, const__)
if(l.id == 19/* θ */||l.id == 61/* g */){
 //considered syms: θ,g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$lexer_symbol=>• sym$generated_symbol
*/
$sym$generated_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(l.id == 18/* τ */||l.id == 62/* t */){
 //considered syms: τ,t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$lexer_symbol=>• sym$literal_symbol
*/
$sym$literal_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(l.id == 63/* \ */){
 //considered syms: \

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$lexer_symbol=>• sym$escaped_symbol
*/
$sym$escaped_symbol(l)
if(!FAILED){
setProduction(55)

return;
}
} else if(!(false )){
 //considered syms: sym,id,any

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$lexer_symbol=>• sym$grouped_symbol sym$grouped_delimiter
*/
$sym$grouped_symbol(l)
if(!FAILED){
$sym$grouped_delimiter(l)
if(!FAILED){
setProduction(55)
add_reduce(2,52);
return;
}
}
}
fail(l);}
    function $sym$grouped_delimiter(l:Lexer) :void{//Production Start
/*
sym$grouped_delimiter=>• θnl
sym$grouped_delimiter=>• θws
*/

if(l.ty == 4/* nl */){
 //considered syms: nl

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_delimiter=>• θnl
*/
_no_check(l);
if(!FAILED){
setProduction(56)

return;
}
} else if(l.ty == 1/* ws */){
 //considered syms: ws

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_delimiter=>• θws
*/
_no_check(l);
if(!FAILED){
setProduction(56)

return;
}
}
fail(l);}
    function $sym$grouped_symbol_group_012_103(l:Lexer) :void{//Production Start
/*
sym$grouped_symbol_group_012_103=>• θsym
sym$grouped_symbol_group_012_103=>• θid
sym$grouped_symbol_group_012_103=>• θany
*/
_skip(l, const__)
if(l.ty == 6/* sym */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_012_103=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(l.ty == 3/* id */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_012_103=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(!(false )){
 //considered syms: any

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_012_103=>• θany
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
}
fail(l);}
    
    function $sym$ignore_symbol(l:Lexer) :void{//Production Start
/*
sym$ignore_symbol=>• sym$generated_symbol
sym$ignore_symbol=>• sym$literal_symbol
sym$ignore_symbol=>• sym$escaped_symbol
sym$ignore_symbol=>• θany
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
*/
_skip(l, const__)
if(l.id == 19/* θ */||l.id == 61/* g */){
 //considered syms: θ,g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$ignore_symbol=>• sym$generated_symbol
*/
$sym$generated_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(l.id == 18/* τ */||l.id == 62/* t */){
 //considered syms: τ,t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$ignore_symbol=>• sym$literal_symbol
*/
$sym$literal_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(l.id == 63/* \ */){
 //considered syms: \

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$ignore_symbol=>• sym$escaped_symbol
*/
$sym$escaped_symbol(l)
if(!FAILED){
setProduction(60)

return;
}
} else if(!(false )){
 //considered syms: any

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$ignore_symbol=>• θany
*/
_no_check(l);
if(!FAILED){
setProduction(60)
add_reduce(1,52);
return;
}
}
fail(l);}
    function $sym$terminal_symbol(l:Lexer) :void{//Production Start
/*
sym$terminal_symbol=>• sym$generated_symbol
sym$terminal_symbol=>• sym$literal_symbol
sym$terminal_symbol=>• sym$escaped_symbol
sym$terminal_symbol=>• sym$assert_function_symbol
sym$terminal_symbol=>• θany
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
*/
_skip(l, const__)
if(l.id == 19/* θ */||l.id == 61/* g */){
 //considered syms: θ,g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$terminal_symbol=>• sym$generated_symbol
*/
$sym$generated_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 18/* τ */||l.id == 62/* t */){
 //considered syms: τ,t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$terminal_symbol=>• sym$literal_symbol
*/
$sym$literal_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 63/* \ */){
 //considered syms: \

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$terminal_symbol=>• sym$escaped_symbol
*/
$sym$escaped_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 59/* assert */||l.id == 60/* shift */){
 //considered syms: assert,shift

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$terminal_symbol=>• sym$assert_function_symbol
*/
$sym$assert_function_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(!(false )){
 //considered syms: any

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$terminal_symbol=>• θany
*/
_no_check(l);
if(!FAILED){
setProduction(61)
add_reduce(1,52);
return;
}
}
fail(l);}
    function $sym$symbol_group_032_105(l:Lexer) :void{//Production Start
/*
sym$symbol_group_032_105=>• (+
sym$symbol_group_032_105=>• (*
*/
_skip(l, const__)
if(l.id == 16/* (+ */){
 //considered syms: (+

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$symbol_group_032_105=>• (+
*/
_no_check(l);
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 15/* (* */){
 //considered syms: (*

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$symbol_group_032_105=>• (*
*/
_no_check(l);
if(!FAILED){
setProduction(62)

return;
}
}
fail(l);}
    
    function $sym$EOF_symbol(l:Lexer) :void{//Production Start
/*
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
//considered syms: $eof

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$EOF_symbol=>• $eof
*/
_with_skip(l, const__, 0/* EOF */);
if(!FAILED){
setProduction(64)
add_reduce(1,54);
return;
}
fail(l);}
    function $sym$empty_symbol(l:Lexer) :void{//Production Start
/*
sym$empty_symbol=>• ɛ
*/
_skip(l, const__)
//considered syms: ɛ

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$empty_symbol=>• ɛ
*/
_with_skip(l, const__, 20/* ɛ */);
if(!FAILED){
setProduction(65)
add_reduce(1,55);
return;
}
fail(l);}
    function $sym$assert_function_symbol(l:Lexer) :void{//Production Start
/*
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
*/
_skip(l, const__)
if(l.id == 59/* assert */){
 //considered syms: assert

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$assert_function_symbol=>• τassert : sym$identifier
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(66)
add_reduce(3,56);
return;
}
}
}
} else if(l.id == 60/* shift */){
 //considered syms: shift

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$assert_function_symbol=>• τshift : sym$identifier
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(66)
add_reduce(3,57);
return;
}
}
}
}
fail(l);}
    function $sym$generated_symbol_group_141_106(l:Lexer) :void{//Production Start
/*
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
*/
_skip(l, const__)
if(l.id == 19/* θ */){
 //considered syms: θ

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$generated_symbol_group_141_106=>• θ
*/
_no_check(l);
if(!FAILED){
setProduction(67)

return;
}
} else if(l.id == 61/* g */){
 //considered syms: g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$generated_symbol_group_141_106=>• τg :
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
setProduction(67)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$generated_symbol(l:Lexer) :void{//Production Start
/*
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
sym$generated_symbol_group_141_106=>• θ
sym$generated_symbol_group_141_106=>• τg :
*/
_skip(l, const__)
//considered syms: θ,g

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
*/
$sym$generated_symbol_group_141_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(68)
add_reduce(2,58);
return;
}
}
fail(l);}
    function $sym$literal_symbol_group_144_107(l:Lexer) :void{//Production Start
/*
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
*/
_skip(l, const__)
if(l.id == 18/* τ */){
 //considered syms: τ

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_144_107=>• τ
*/
_no_check(l);
if(!FAILED){
setProduction(69)

return;
}
} else if(l.id == 62/* t */){
 //considered syms: t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_144_107=>• τt :
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 40/* : */);
if(!FAILED){
setProduction(69)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$literal_symbol_group_046_108(l:Lexer) :void{//Production Start
/*
sym$literal_symbol_group_046_108=>• sym$identifier
sym$literal_symbol_group_046_108=>• def$natural
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
def$natural=>• θnum
*/
_skip(l, const__)
if(l.id == 78/* _ */||l.id == 79/* $ */||l.ty == 3/* id */||l.ty == 7/* key */){
 //considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_046_108=>• sym$identifier
*/
$sym$identifier(l)
if(!FAILED){
setProduction(70)

return;
}
} else if(l.ty == 2/* num */){
 //considered syms: num

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_046_108=>• def$natural
*/
$def$natural(l)
if(!FAILED){
setProduction(70)

return;
}
}
fail(l);}
    function $sym$literal_symbol(l:Lexer) :void{//Production Start
/*
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
sym$literal_symbol_group_144_107=>• τ
sym$literal_symbol_group_144_107=>• τt :
*/
_skip(l, const__)
//considered syms: τ,t

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
*/
$sym$literal_symbol_group_144_107(l)
if(!FAILED){
$sym$literal_symbol_group_046_108(l)
if(!FAILED){
setProduction(71)
add_reduce(2,59);
return;
}
}
fail(l);}
    function $sym$escaped_symbol_group_050_109(l:Lexer) :void{//Production Start
/*
sym$escaped_symbol_group_050_109=>• θid
sym$escaped_symbol_group_050_109=>• θtok
sym$escaped_symbol_group_050_109=>• θsym
*/
_skip(l, const__)
if(l.ty == 3/* id */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$escaped_symbol_group_050_109=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(72)

return;
}
} else if(l.ty == 5/* tok */){
 //considered syms: tok

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$escaped_symbol_group_050_109=>• θtok
*/
_no_check(l);
if(!FAILED){
setProduction(72)

return;
}
} else if(l.ty == 6/* sym */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$escaped_symbol_group_050_109=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(72)

return;
}
}
fail(l);}
    function $sym$escaped_symbol(l:Lexer) :void{//Production Start
/*
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
*/
_skip(l, const__)
//considered syms: \

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
*/
_with_skip(l, const__, 63/* \ */);
if(!FAILED){
$sym$escaped_symbol_group_050_109(l)
if(!FAILED){
setProduction(73)
add_reduce(2,60);
return;
}
}
fail(l);}
    function $sym$production_symbol(l:Lexer) :void{//Production Start
/*
sym$production_symbol=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$production_symbol=>• sym$identifier
*/
$sym$identifier(l)
if(!FAILED){
setProduction(74)
add_reduce(1,61);
return;
}
fail(l);}
    function $sym$imported_production_symbol(l:Lexer) :void{//Production Start
/*
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
sym$production_id=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$imported_production_symbol=>• sym$production_id :: sym$identifier
*/
$sym$production_id(l)
if(!FAILED){
_with_skip(l, const__, 17/* :: */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(75)
add_reduce(3,50);
return;
}
}
}
fail(l);}
    function $sym$production_id(l:Lexer) :void{//Production Start
/*
sym$production_id=>• sym$identifier
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$production_id=>• sym$identifier
*/
$sym$identifier(l)
if(!FAILED){
setProduction(76)

return;
}
fail(l);}
    function $sym$identifier(l:Lexer) :void{//Production Start
/*
sym$identifier=>• def$js_identifier
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$identifier=>• def$js_identifier
*/
$def$js_identifier(l)
if(!FAILED){
setProduction(77)

return;
}
fail(l);}
    function $sym$js_identifier(l:Lexer) :void{//Production Start
/*
sym$js_identifier=>• def$id
def$id=>• θid
*/
_skip(l, const__)
//considered syms: id

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$js_identifier=>• def$id
*/
$def$id(l)
if(!FAILED){
setProduction(78)

return;
}
fail(l);}
    function $def$natural(l:Lexer) :void{//Production Start
/*
def$natural=>• θnum
*/
_skip(l, const__)
//considered syms: num

//Single Production Completion

//peek 0

//block 0

//groups false
/*
def$natural=>• θnum
*/
_with_skip(l, const__, 2/* num */);
if(!FAILED){
setProduction(90)

return;
}
fail(l);}
    function $def$id(l:Lexer) :void{//Production Start
/*
def$id=>• θid
*/
_skip(l, const__)
//considered syms: id

//Single Production Completion

//peek 0

//block 0

//groups false
/*
def$id=>• θid
*/
_with_skip(l, const__, 3/* id */);
if(!FAILED){
setProduction(91)

return;
}
fail(l);}
    function $def$js_identifier(l:Lexer) :void{//Production Start
/*
def$js_identifier=>• def$js_id_symbols
def$js_id_symbols=>• def$js_id_symbols θid
def$js_id_symbols=>• def$js_id_symbols θkey
def$js_id_symbols=>• def$js_id_symbols _
def$js_id_symbols=>• def$js_id_symbols $
def$js_id_symbols=>• def$js_id_symbols θnum
def$js_id_symbols=>• def$js_id_symbols θhex
def$js_id_symbols=>• def$js_id_symbols θbin
def$js_id_symbols=>• def$js_id_symbols θoct
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
*/
_skip(l, const__)
//considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 0

//groups false
/*
def$js_identifier=>• def$js_id_symbols
*/
$def$js_id_symbols(l)
if(!FAILED){
setProduction(99)

return;
}
fail(l);}
    
    function $prd$productions (l: Lexer): void{
                /*
prd$productions=>• prd$production|<>: 3;
prd$productions=>• fn$referenced_function|<>: 3;
prd$productions=>• prd$productions prd$production|<>: 3;
prd$productions=>• prd$productions cm$comment|<>: 3;
prd$productions=>• prd$productions fn$referenced_function|<>: 3;
prd$productions=>•|<>
*/
_skip(l, const__)
if(idm0.has(l.id)){idm0.get(l.id)(l); } else if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(0,0,3); stack_ptr-=0;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 18: //fn$referenced_function
State2(l)
 break;
case 8: //prd$production
State1(l)
 break;
case 3: //prd$productions
_skip(l, const__)
if(l.ty == 0/* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State3(cp)
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
    function State1 (l: Lexer): void{
                /*
prd$productions=>prd$production •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(4,1,3); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State2 (l: Lexer): void{
                /*
prd$productions=>fn$referenced_function •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(5,1,3); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State3 (l: Lexer): void{
                /*
prd$productions=>prd$productions • prd$production|<>: 3;
prd$productions=>prd$productions • cm$comment|<>: 3;
prd$productions=>prd$productions • fn$referenced_function|<>: 3
*/
_skip(l, const__)
if(idm3.has(l.id)){idm3.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State163(l)
 break;
case 18: //fn$referenced_function
State164(l)
 break;
case 8: //prd$production
State162(l)
 break;
case 3/*prd$productions*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State4 (l: Lexer): void{
                /*
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>: 8;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>: 8;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(l.id == 78/* _ */||l.id == 79/* $ */||l.ty == 3/* id */||l.ty == 7/* key */){ 
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
case 7: //prd$production_group_013_103
State169(l)
 break;
case 4: //prd$production_group_08_100
State168(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State5 (l: Lexer): void{
                /*
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(l.id == 78/* _ */||l.id == 79/* $ */||l.ty == 3/* id */||l.ty == 7/* key */){ 
             
            $prd$production_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 7: //prd$production_group_013_103
State178(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pre$preamble (l: Lexer): void{
                /*
pre$preamble=>• pre$preamble pre$preamble_clause|<>: 29;
pre$preamble=>• pre$preamble_clause|<>: 29
*/
_skip(l, const__)
if(l.id == 47/* @ */||l.id == 57/* # */){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 30: //pre$preamble_clause
State25(l)
 break;
case 29: //pre$preamble
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.ty == 0/* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State24(cp)
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
    function State24 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble • pre$preamble_clause|<>: 29
*/
_skip(l, const__)
if(l.id == 47/* @ */||l.id == 57/* # */){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 30: //pre$preamble_clause
State196(l)
 break;
case 29/*pre$preamble*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State25 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble_clause •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 47/* @ */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(42,1,29); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody2_102 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|ws: 38;
pre$import_preamble_HC_listbody2_102=>• θws|ws
*/
_skip(l, const_2_)
if(l.ty == 1/* ws */){ 
             
            _no_check(l);;stack_ptr++;State28(l);
             
            }
else fail(l);
}
    function State28 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>θws •|ws
*/
_skip(l, const_2_)
if(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            completeProduction(42,1,38); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody1_104 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|id: 40;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|id: 40
*/
_skip(l, const_2_)
if(l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 40: //pre$import_preamble_HC_listbody1_104
_skip(l, const_2_)
if(l.ty == 0/* EOF */||l.ty == 1/* ws */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State30(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 39: //pre$import_preamble_group_019_103
State31(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State30 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|id: 40
*/
_skip(l, const_2_)
if(l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 39: //pre$import_preamble_group_019_103
State198(l)
 break;
case 40/*pre$import_preamble_HC_listbody1_104*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State31 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|id
*/
_skip(l, const_2_)
if(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            completeProduction(49,1,40); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$symbols_preamble_HC_listbody2_101 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|θ: 31;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|θ: 31
*/
_skip(l, const_4_)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */||l.ty == 3/* id */||l.ty == 6/* sym */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 4/* nl */ )){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55: //sym$lexer_symbol
State38(l)
 break;
case 31: //pre$symbols_preamble_HC_listbody2_101
_skip(l, const_4_)
if(l.ty == 0/* EOF */||l.ty == 4/* nl */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State37(cp)
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
    function State37 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|θ: 31
*/
_skip(l, const_4_)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */||l.ty == 3/* id */||l.ty == 6/* sym */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 4/* nl */ )){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55: //sym$lexer_symbol
State199(l)
 break;
case 31/*pre$symbols_preamble_HC_listbody2_101*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State38 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|θ
*/
_skip(l, const_4_)
if(idm38r.has(l.id)){idm38r.get(l.id)(l); return;} else if(tym38r.has(l.ty)){tym38r.get(l.ty)(l); return;}
else fail(l);
}
    function State50 (l: Lexer): void{
                /*
sym$grouped_symbol=>sym$grouped_symbol_group_012_103 •|nl
*/
if(!(!(false ) )){ 
             
            completeProduction(49,1,59); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody4_105 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|ws: 41;
pre$import_preamble_HC_listbody4_105=>• θws|ws
*/
_skip(l, const_2_)
if(l.ty == 1/* ws */){ 
             
            _no_check(l);;stack_ptr++;State56(l);
             
            }
else fail(l);
}
    function State56 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>θws •|ws
*/
_skip(l, const_2_)
if(l.id == 54/* AS */||l.id == 55/* as */||l.ty == 0/* EOF */||l.ty == 1/* ws */){ 
             
            completeProduction(42,1,41); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $cm$comment_data (l: Lexer): void{
                /*
cm$comment_data=>• cm$comment_primitive|nl: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|nl: 47
*/
if(l.ty == 1/* ws */||l.ty == 2/* num */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48: //cm$comment_primitive
State58(l)
 break;
case 47: //cm$comment_data
if(l.ty == 0/* EOF */||l.ty == 4/* nl */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State59(cp)
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
    function State58 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_primitive •|nl
*/
if(tym58r.has(l.ty)){tym58r.get(l.ty)(l); return;}
else fail(l);
}
    function State59 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_data • cm$comment_primitive|nl: 47
*/
if(l.ty == 1/* ws */||l.ty == 2/* num */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48: //cm$comment_primitive
State211(l)
 break;
case 47/*cm$comment_data*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$condition_symbol_list (l: Lexer): void{
                /*
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|): 50;
sym$condition_symbol_list=>• sym$terminal_symbol|): 50
*/
_skip(l, const__)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 59/* assert */||l.id == 60/* shift */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            } else if(!(l.id == 30/* ) */||l.ty == 0/* EOF */ )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State75(l)
 break;
case 50: //sym$condition_symbol_list
_skip(l, const__)
if(l.id == 30/* ) */||l.ty == 0/* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State74(cp)
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
    function State74 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|): 50
*/
_skip(l, const__)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 59/* assert */||l.id == 60/* shift */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            } else if(!(l.id == 30/* ) */||l.ty == 0/* EOF */ )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State217(l)
 break;
case 50/*sym$condition_symbol_list*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State75 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$terminal_symbol •|)
*/
_skip(l, const__)
if(idm75r.has(l.id)){idm75r.get(l.id)(l); return;} else if(tym75r.has(l.ty)){tym75r.get(l.ty)(l); return;}
else fail(l);
}
    function $sym$ignore_symbols (l: Lexer): void{
                /*
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|nl: 54;
sym$ignore_symbols=>• sym$ignore_symbol|nl: 54
*/
_skip(l, const_4_)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 4/* nl */ )){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60: //sym$ignore_symbol
State85(l)
 break;
case 54: //sym$ignore_symbols
_skip(l, const_4_)
if(l.ty == 0/* EOF */||l.ty == 4/* nl */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State84(cp)
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
    function State84 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|nl: 54
*/
_skip(l, const_4_)
if(l.id == 18/* τ */||l.id == 19/* θ */||l.id == 61/* g */||l.id == 62/* t */||l.id == 63/* \ */){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 4/* nl */ )){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60: //sym$ignore_symbol
State220(l)
 break;
case 54/*sym$ignore_symbols*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State85 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbol •|nl
*/
_skip(l, const_4_)
if(idm85r.has(l.id)){idm85r.get(l.id)(l); return;} else if(tym85r.has(l.ty)){tym85r.get(l.ty)(l); return;}
else fail(l);
}
    function $sym$grouped_symbol (l: Lexer): void{
                /*
sym$grouped_symbol=>• sym$grouped_symbol sym$grouped_symbol_group_012_103|nl: 59;
sym$grouped_symbol=>• sym$grouped_symbol_group_012_103|nl: 59
*/
if(l.ty == 3/* id */||l.ty == 6/* sym */){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 4/* nl */ )){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 59: //sym$grouped_symbol
if(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 4/* nl */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State90(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 57: //sym$grouped_symbol_group_012_103
State50(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State90 (l: Lexer): void{
                /*
sym$grouped_symbol=>sym$grouped_symbol • sym$grouped_symbol_group_012_103|nl: 59
*/
if(l.ty == 3/* id */||l.ty == 6/* sym */){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            } else if(!(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 4/* nl */ )){ 
             
            $sym$grouped_symbol_group_012_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 57: //sym$grouped_symbol_group_012_103
State201(l)
 break;
case 59/*sym$grouped_symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $fn$js_data (l: Lexer): void{
                /*
fn$js_data=>• fn$js_primitive|}: 23;
fn$js_data=>• fn$js_data_block|}: 23;
fn$js_data=>• fn$js_data fn$js_primitive|}: 23;
fn$js_data=>• fn$js_data fn$js_data_block|}: 23;
fn$js_data=>•|}
*/
_skip(l, const_2_)
if(idm100.has(l.id)){idm100.get(l.id)(l); } else if(tym100.has(l.ty)){tym100.get(l.ty)(l); } else if(!(l.id == 38/* } */ )){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            } else if(idm100r.has(l.id)){idm100r.get(l.id)(l); return;} else if(tym100r.has(l.ty)){tym100r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 26: //fn$js_data_block
State102(l)
 break;
case 25: //fn$js_primitive
State101(l)
 break;
case 23: //fn$js_data
_skip(l, const_2_)
if(l.id == 38/* } */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State103(cp)
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
    function State101 (l: Lexer): void{
                /*
fn$js_data=>fn$js_primitive •|}
*/
_skip(l, const_2_)
if(idm102r.has(l.id)){idm102r.get(l.id)(l); return;} else if(tym102r.has(l.ty)){tym102r.get(l.ty)(l); return;}
else fail(l);
}
    function State102 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data_block •|}
*/
_skip(l, const_2_)
if(idm102r.has(l.id)){idm102r.get(l.id)(l); return;} else if(tym102r.has(l.ty)){tym102r.get(l.ty)(l); return;}
else fail(l);
}
    function State103 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data • fn$js_primitive|}: 23;
fn$js_data=>fn$js_data • fn$js_data_block|}: 23
*/
_skip(l, const_2_)
if(idm100.has(l.id)){idm100.get(l.id)(l); } else if(tym100.has(l.ty)){tym100.get(l.ty)(l); } else if(!(l.id == 38/* } */ )){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 26: //fn$js_data_block
State228(l)
 break;
case 25: //fn$js_primitive
State227(l)
 break;
case 23/*fn$js_data*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State160 (l: Lexer): void{
                /*
def$js_id_symbols=>θkey •|id
*/
if(idm173r.has(l.id)){idm173r.get(l.id)(l); return;} else if(tym173r.has(l.ty)){tym173r.get(l.ty)(l); return;}
else fail(l);
}
    function State162 (l: Lexer): void{
                /*
prd$productions=>prd$productions prd$production •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(6,2,3); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State163 (l: Lexer): void{
                /*
prd$productions=>prd$productions cm$comment •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(1,2,3); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State164 (l: Lexer): void{
                /*
prd$productions=>prd$productions fn$referenced_function •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(7,2,3); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State168 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>: 8;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(l.id == 24/* → */||l.id == 25/* > */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 9: //prd$production_start_symbol
State275(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State169 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(l.id == 24/* → */||l.id == 25/* > */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 9: //prd$production_start_symbol
State278(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State173 (l: Lexer): void{
                /*
def$js_id_symbols=>_ •|→
*/
if(idm173r.has(l.id)){idm173r.get(l.id)(l); return;} else if(tym173r.has(l.ty)){tym173r.get(l.ty)(l); return;}
else fail(l);
}
    function State174 (l: Lexer): void{
                /*
def$js_id_symbols=>$ •|→
*/
if(idm173r.has(l.id)){idm173r.get(l.id)(l); return;} else if(tym173r.has(l.ty)){tym173r.get(l.ty)(l); return;}
else fail(l);
}
    function State175 (l: Lexer): void{
                /*
def$js_id_symbols=>θid •|→
*/
if(idm173r.has(l.id)){idm173r.get(l.id)(l); return;} else if(tym173r.has(l.ty)){tym173r.get(l.ty)(l); return;}
else fail(l);
}
    function State178 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(l.id == 24/* → */||l.id == 25/* > */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 9: //prd$production_start_symbol
State280(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State196 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble pre$preamble_clause •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 47/* @ */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(41,2,29); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State198 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|id
*/
_skip(l, const_2_)
if(l.ty == 0/* EOF */||l.ty == 1/* ws */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ 
             
            completeProduction(38,2,40); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State199 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|θ
*/
_skip(l, const_4_)
if(idm199r.has(l.id)){idm199r.get(l.id)(l); return;} else if(tym199r.has(l.ty)){tym199r.get(l.ty)(l); return;}
else fail(l);
}
    function State201 (l: Lexer): void{
                /*
sym$grouped_symbol=>sym$grouped_symbol sym$grouped_symbol_group_012_103 •|nl
*/
if(!(!(false ) )){ 
             
            completeProduction(38,2,59); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State211 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_data cm$comment_primitive •|nl
*/
if(tym211r.has(l.ty)){tym211r.get(l.ty)(l); return;}
else fail(l);
}
    function State217 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|)
*/
_skip(l, const__)
if(idm217r.has(l.id)){idm217r.get(l.id)(l); return;} else if(tym217r.has(l.ty)){tym217r.get(l.ty)(l); return;}
else fail(l);
}
    function State220 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|nl
*/
_skip(l, const_4_)
if(idm220r.has(l.id)){idm220r.get(l.id)(l); return;} else if(tym220r.has(l.ty)){tym220r.get(l.ty)(l); return;}
else fail(l);
}
    function $def$js_id_symbols (l: Lexer): void{
                /*
def$js_id_symbols=>• def$js_id_symbols θid|id: 100;
def$js_id_symbols=>• def$js_id_symbols θkey|id: 100;
def$js_id_symbols=>• def$js_id_symbols _|id: 100;
def$js_id_symbols=>• def$js_id_symbols $|id: 100;
def$js_id_symbols=>• def$js_id_symbols θnum|id: 100;
def$js_id_symbols=>• def$js_id_symbols θhex|id: 100;
def$js_id_symbols=>• def$js_id_symbols θbin|id: 100;
def$js_id_symbols=>• def$js_id_symbols θoct|id: 100;
def$js_id_symbols=>• _|id;
def$js_id_symbols=>• $|id;
def$js_id_symbols=>• θid|id;
def$js_id_symbols=>• θkey|id
*/
_skip(l, const_4_)
if(idm224.has(l.id)){idm224.get(l.id)(l); } else if(tym224.has(l.ty)){tym224.get(l.ty)(l); }
else fail(l);
}
    function State227 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data fn$js_primitive •|}
*/
_skip(l, const_2_)
if(idm228r.has(l.id)){idm228r.get(l.id)(l); return;} else if(tym228r.has(l.ty)){tym228r.get(l.ty)(l); return;}
else fail(l);
}
    function State228 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data fn$js_data_block •|}
*/
_skip(l, const_2_)
if(idm228r.has(l.id)){idm228r.get(l.id)(l); return;} else if(tym228r.has(l.ty)){tym228r.get(l.ty)(l); return;}
else fail(l);
}
    function $pb$production_bodies (l: Lexer): void{
                /*
pb$production_bodies=>• pb$production_body|│: 12;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>• pb$production_bodies cm$comment|│: 12
*/
_skip(l, const__)
if(idm299.has(l.id)){idm299.get(l.id)(l); } else if(tym299.has(l.ty)){tym299.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 13: //pb$production_body
State234(l)
 break;
case 12: //pb$production_bodies
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 30/* ) */||l.id == 45/* ↦ */||l.id == 46/* f */||l.ty == 0/* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State235(cp)
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
    function State234 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_body •|│
*/
_skip(l, const__)
if(idm234r.has(l.id)){idm234r.get(l.id)(l); return;} else if(tym234r.has(l.ty)){tym234r.get(l.ty)(l); return;}
else fail(l);
}
    function State235 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 12
*/
_skip(l, const__)
if(idm342.has(l.id)){idm342.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State300(l)
 break;
case 11: //pb$production_bodies_group_04_100
State299(l)
 break;
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State237 (l: Lexer): void{
                /*
pb$production_body=>pb$entries •|│
*/
_skip(l, const__)
if(idm237r.has(l.id)){idm237r.get(l.id)(l); return;} else if(tym237r.has(l.ty)){tym237r.get(l.ty)(l); return;}
else fail(l);
}
    function State239 (l: Lexer): void{
                /*
pb$entries=>pb$body_entries • fn$reduce_function|│: 14;
pb$entries=>pb$body_entries •|│;
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 15;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 15
*/
_skip(l, const__)
if(idm239.has(l.id)){idm239.get(l.id)(l); } else if(tym309.has(l.ty)){tym309.get(l.ty)(l); } else if(idm239r.has(l.id)){idm239r.get(l.id)(l); return;} else if(tym239r.has(l.ty)){tym239r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State321(l)
 break;
case 22: //fn$function_clause
State319(l)
 break;
case 21: //fn$reduce_function
State318(l)
 break;
case 17: //pb$condition_clause
State320(l)
 break;
case 14/*pb$entries*/:
case 15/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State242 (l: Lexer): void{
                /*
pb$body_entries=>sym$symbol •|↦;
sym$symbol=>sym$symbol • ?|↦;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|↦: 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); } else if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(tym242r.has(l.ty)){tym242r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_032_105
State304(l)
 break;
case 15/*pb$body_entries*/:
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State243 (l: Lexer): void{
                /*
pb$body_entries=>pb$condition_clause •|↦
*/
_skip(l, const__)
if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(tym242r.has(l.ty)){tym242r.get(l.ty)(l); return;}
else fail(l);
}
    function State244 (l: Lexer): void{
                /*
pb$body_entries=>fn$function_clause •|↦
*/
_skip(l, const__)
if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(tym242r.has(l.ty)){tym242r.get(l.ty)(l); return;}
else fail(l);
}
    function State245 (l: Lexer): void{
                /*
pb$body_entries=>[ • pb$body_entries ]|↦: 15
*/
_skip(l, const__)
if(idm245.has(l.id)){idm245.get(l.id)(l); } else if(tym245.has(l.ty)){tym245.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 15: //pb$body_entries
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 22/* │ */||l.id == 23/* | */||l.id == 30/* ) */||l.id == 57/* # */||l.ty == 0/* EOF */){ return;}
State324(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State246 (l: Lexer): void{
                /*
sym$symbol=>sym$generated_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State247 (l: Lexer): void{
                /*
sym$symbol=>sym$production_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State248 (l: Lexer): void{
                /*
sym$symbol=>sym$imported_production_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State249 (l: Lexer): void{
                /*
sym$symbol=>sym$literal_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State250 (l: Lexer): void{
                /*
sym$symbol=>sym$escaped_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State251 (l: Lexer): void{
                /*
sym$symbol=>sym$assert_function_symbol •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State252 (l: Lexer): void{
                /*
sym$symbol=>θsym •|↦
*/
_skip(l, const__)
if(idm252r.has(l.id)){idm252r.get(l.id)(l); return;} else if(tym252r.has(l.ty)){tym252r.get(l.ty)(l); return;}
else fail(l);
}
    function State253 (l: Lexer): void{
                /*
sym$symbol=>θtok •|↦
*/
_skip(l, const__)
if(idm253r.has(l.id)){idm253r.get(l.id)(l); return;} else if(tym253r.has(l.ty)){tym253r.get(l.ty)(l); return;}
else fail(l);
}
    function State275 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|<>: 8;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(idm278.has(l.id)){idm278.get(l.id)(l); } else if(tym278.has(l.ty)){tym278.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 12: //pb$production_bodies
State346(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State278 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(idm278.has(l.id)){idm278.get(l.id)(l); } else if(tym278.has(l.ty)){tym278.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 12: //pb$production_bodies
State342(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State280 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|<>: 8
*/
_skip(l, const__)
if(idm278.has(l.id)){idm278.get(l.id)(l); } else if(tym278.has(l.ty)){tym278.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 12: //pb$production_bodies
State345(l)
 break;
case 8/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$symbol (l: Lexer): void{
                /*
sym$symbol=>• sym$generated_symbol|): 63;
sym$symbol=>• sym$production_symbol|): 63;
sym$symbol=>• sym$imported_production_symbol|): 63;
sym$symbol=>• sym$literal_symbol|): 63;
sym$symbol=>• sym$escaped_symbol|): 63;
sym$symbol=>• sym$assert_function_symbol|): 63;
sym$symbol=>• ( pb$production_bodies )|);
sym$symbol=>• sym$symbol ?|): 63;
sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>• θsym|);
sym$symbol=>• θtok|);
sym$symbol=>• sym$symbol sym$symbol_group_032_105 )|): 63
*/
_skip(l, const__)
if(idm296.has(l.id)){idm296.get(l.id)(l); } else if(tym296.has(l.ty)){tym296.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 75: //sym$imported_production_symbol
State248(l)
 break;
case 74: //sym$production_symbol
State247(l)
 break;
case 73: //sym$escaped_symbol
State250(l)
 break;
case 71: //sym$literal_symbol
State249(l)
 break;
case 68: //sym$generated_symbol
State246(l)
 break;
case 66: //sym$assert_function_symbol
State251(l)
 break;
case 63: //sym$symbol
_skip(l, const__)
if(const_8_.includes(l.id)||l.ty == 0/* EOF */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State298(cp)
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
    function State297 (l: Lexer): void{
                /*
sym$symbol=>( • pb$production_bodies )|): 63
*/
_skip(l, const__)
if(idm278.has(l.id)){idm278.get(l.id)(l); } else if(tym278.has(l.ty)){tym278.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
_skip(l, const__)
if(const_8_.includes(l.id)||l.ty == 0/* EOF */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */){ return;}
State242(l)
 break;
case 15: //pb$body_entries
State239(l)
 break;
case 14: //pb$entries
State237(l)
 break;
case 13: //pb$production_body
State234(l)
 break;
case 12: //pb$production_bodies
State334(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State298 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|): 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_032_105
State304(l)
 break;
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State299 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|│: 12
*/
_skip(l, const__)
if(idm299.has(l.id)){idm299.get(l.id)(l); } else if(tym299.has(l.ty)){tym299.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 13: //pb$production_body
State358(l)
 break;
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State300 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies cm$comment •|│
*/
_skip(l, const__)
if(idm300r.has(l.id)){idm300r.get(l.id)(l); return;} else if(tym300r.has(l.ty)){tym300r.get(l.ty)(l); return;}
else fail(l);
}
    function State303 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol ? •|↦
*/
_skip(l, const__)
if(idm303r.has(l.id)){idm303r.get(l.id)(l); return;} else if(tym303r.has(l.ty)){tym303r.get(l.ty)(l); return;}
else fail(l);
}
    function State304 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 • sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol sym$symbol_group_032_105 • )|↦
*/
_skip(l, const__)
if(idm304.has(l.id)){idm304.get(l.id)(l); } else if(!(const_7_.includes(l.id)||l.ty == 0/* EOF */||l.ty == 3/* id */||l.ty == 5/* tok */||l.ty == 6/* sym */||l.ty == 7/* key */ )){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State340(l)
 break;
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pb$body_entries (l: Lexer): void{
                /*
pb$body_entries=>• sym$symbol|↦: 15;
pb$body_entries=>• pb$condition_clause|↦: 15;
pb$body_entries=>• fn$function_clause|↦: 15;
pb$body_entries=>• pb$body_entries fn$function_clause|↦: 15;
pb$body_entries=>• pb$body_entries pb$condition_clause|↦: 15;
pb$body_entries=>• pb$body_entries sym$symbol|↦: 15;
pb$body_entries=>• [ pb$body_entries ]|↦
*/
_skip(l, const__)
if(idm309.has(l.id)){idm309.get(l.id)(l); } else if(tym309.has(l.ty)){tym309.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State242(l)
 break;
case 22: //fn$function_clause
State244(l)
 break;
case 17: //pb$condition_clause
State243(l)
 break;
case 15: //pb$body_entries
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 22/* │ */||l.id == 23/* | */||l.id == 27/* ] */||l.id == 30/* ) */||l.id == 57/* # */||l.ty == 0/* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State310(cp)
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
    function State310 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 15;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 15
*/
_skip(l, const__)
if(idm310.has(l.id)){idm310.get(l.id)(l); } else if(tym309.has(l.ty)){tym309.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State321(l)
 break;
case 22: //fn$function_clause
State319(l)
 break;
case 17: //pb$condition_clause
State320(l)
 break;
case 15/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State318 (l: Lexer): void{
                /*
pb$entries=>pb$body_entries fn$reduce_function •|│
*/
_skip(l, const__)
if(idm318r.has(l.id)){idm318r.get(l.id)(l); return;} else if(tym318r.has(l.ty)){tym318r.get(l.ty)(l); return;}
else fail(l);
}
    function State319 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries fn$function_clause •|↦
*/
_skip(l, const__)
if(idm321r.has(l.id)){idm321r.get(l.id)(l); return;} else if(tym321r.has(l.ty)){tym321r.get(l.ty)(l); return;}
else fail(l);
}
    function State320 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries pb$condition_clause •|↦
*/
_skip(l, const__)
if(idm321r.has(l.id)){idm321r.get(l.id)(l); return;} else if(tym321r.has(l.ty)){tym321r.get(l.ty)(l); return;}
else fail(l);
}
    function State321 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries sym$symbol •|↦;
sym$symbol=>sym$symbol • ?|↦;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|↦: 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); } else if(idm321r.has(l.id)){idm321r.get(l.id)(l); return;} else if(tym321r.has(l.ty)){tym321r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_032_105
State304(l)
 break;
case 15/*pb$body_entries*/:
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State324 (l: Lexer): void{
                /*
pb$body_entries=>[ pb$body_entries • ]|↦;
pb$body_entries=>pb$body_entries • fn$function_clause|]: 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|]: 15;
pb$body_entries=>pb$body_entries • sym$symbol|]: 15
*/
_skip(l, const__)
if(idm324.has(l.id)){idm324.get(l.id)(l); } else if(tym309.has(l.ty)){tym309.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State321(l)
 break;
case 22: //fn$function_clause
State319(l)
 break;
case 17: //pb$condition_clause
State320(l)
 break;
case 15/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State334 (l: Lexer): void{
                /*
sym$symbol=>( pb$production_bodies • )|↦;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|): 12;
pb$production_bodies=>pb$production_bodies • cm$comment|): 12
*/
_skip(l, const__)
if(idm334.has(l.id)){idm334.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State300(l)
 break;
case 11: //pb$production_bodies_group_04_100
State299(l)
 break;
case 63/*sym$symbol*/:
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State340 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 sym$terminal_symbol • )|↦
*/
_skip(l, const__)
if(l.id == 30/* ) */){ 
             
            _no_check(l);;stack_ptr++;State364(l);
             
            }
else fail(l);
}
    function State341 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 ) •|↦
*/
_skip(l, const__)
if(idm341r.has(l.id)){idm341r.get(l.id)(l); return;} else if(tym341r.has(l.ty)){tym341r.get(l.ty)(l); return;}
else fail(l);
}
    function State342 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|<>;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 12
*/
_skip(l, const__)
if(idm342.has(l.id)){idm342.get(l.id)(l); } else if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(10,4,8); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State300(l)
 break;
case 11: //pb$production_bodies_group_04_100
State299(l)
 break;
case 8/*prd$production*/:
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State345 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|<>;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 12
*/
_skip(l, const__)
if(idm342.has(l.id)){idm342.get(l.id)(l); } else if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(11,4,8); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State300(l)
 break;
case 11: //pb$production_bodies_group_04_100
State299(l)
 break;
case 8/*prd$production*/:
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State346 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|<>: 8;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|<>;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 12
*/
_skip(l, const__)
if(idm346.has(l.id)){idm346.get(l.id)(l); } else if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(12,4,8); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State300(l)
 break;
case 11: //pb$production_bodies_group_04_100
State299(l)
 break;
case 6: //prd$production_group_111_102
State368(l)
 break;
case 8/*prd$production*/:
case 12/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State358 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|│
*/
_skip(l, const__)
if(idm358r.has(l.id)){idm358r.get(l.id)(l); return;} else if(tym358r.has(l.ty)){tym358r.get(l.ty)(l); return;}
else fail(l);
}
    function State359 (l: Lexer): void{
                /*
sym$symbol=>( pb$production_bodies ) •|↦
*/
_skip(l, const__)
if(idm341r.has(l.id)){idm341r.get(l.id)(l); return;} else if(tym341r.has(l.ty)){tym341r.get(l.ty)(l); return;}
else fail(l);
}
    function State363 (l: Lexer): void{
                /*
pb$body_entries=>[ pb$body_entries ] •|↦
*/
_skip(l, const__)
if(idm363r.has(l.id)){idm363r.get(l.id)(l); return;} else if(tym363r.has(l.ty)){tym363r.get(l.ty)(l); return;}
else fail(l);
}
    function State364 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 sym$terminal_symbol ) •|↦
*/
_skip(l, const__)
if(idm364r.has(l.id)){idm364r.get(l.id)(l); return;} else if(tym364r.has(l.ty)){tym364r.get(l.ty)(l); return;}
else fail(l);
}
    function State368 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|<>
*/
_skip(l, const__)
if(l.id == 12/* <> */||l.id == 13/* +> */||l.id == 45/* ↦ */||l.id == 46/* f */||l.id == 57/* # */||l.ty == 0/* EOF */){ 
             
            completeProduction(9,5,8); stack_ptr-=5;
             
            ;return}
else fail(l);
}
    function $prd$production (l: Lexer): void{
                /*
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|<>
*/
_skip(l, const__)
if(idm399.has(l.id)){idm399.get(l.id)(l); }
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