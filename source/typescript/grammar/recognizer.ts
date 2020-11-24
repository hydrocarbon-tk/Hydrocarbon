
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
    prev_off: i32;


    constructor() {
        this.ty = 0; //Default "non-value" for types is 1<<18;
        this.id = 0;
        this.tl = 0;
        this.off = 0;
        this.prev_off = 0;
    }

    copy(destination: Lexer = new Lexer()) : Lexer {
        destination.off = this.off;
        destination.id = this.id;
        destination.ty = this.ty;
        destination.tl = this.tl;
        destination.prev_off = this.prev_off;
        return destination;
    }

    sync(marker: Lexer) : void { marker.copy(this); }

    peek() : Lexer {

        var peeking_marker: Lexer = new Lexer();

        peeking_marker.copy(peeking_marker);

        peeking_marker.next();

        return peeking_marker;
    }

    getOffsetRegionDelta(): u32 {
        return this.off - this.prev_off;
    }

    advanceOffsetRegion(): void {
        this.prev_off = this.off + this.tl;
    }

    syncOffsetRegion(): void {
        this.prev_off = this.off ;
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
if(length <= 6){type = TokenKeyword; this.id =11; length = 6;}
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
if(length <= 4){type = TokenKeyword; this.id =12; length = 4;}
}
}
}
}
else if(val == 73 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 71 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 78 ){
if(length <= 3){type = TokenKeyword; this.id =35; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 69 ){
if(length <= 6){type = TokenKeyword; this.id =13; length = 6;}
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
if(length <= 6){type = TokenKeyword; this.id =17; length = 6;}
}
}
}
}
}
}
else if(val == 69 ){
if(length <= 1){type = TokenKeyword; this.id =71; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
if(length <= 3){type = TokenKeyword; this.id =34; length = 3;}
const val: u32 = str.charCodeAt(base+3)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 82 ){
if(length <= 5){type = TokenKeyword; this.id =14; length = 5;}
}
}
}
}
else if(val == 88 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =16; length = 3;}
}
else if(val == 67 ){
if(length <= 3){type = TokenKeyword; this.id =33; length = 3;}
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
if(length <= 4){type = TokenKeyword; this.id =15; length = 4;}
}
}
}
}
else if(val == 65 ){
if(length <= 1){type = TokenKeyword; this.id =67; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
if(length <= 2){type = TokenKeyword; this.id =19; length = 2;}
}
}
else if(val == 97 ){
if(length <= 1){type = TokenKeyword; this.id =63; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
if(length <= 2){type = TokenKeyword; this.id =20; length = 2;}
const val: u32 = str.charCodeAt(base+2)
if(val == 115 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+4)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+5)
if(val == 116 ){
if(length <= 6){type = TokenKeyword; this.id =55; length = 6;}
}
}
}
}
}
}
else if(val == 70 ){
if(length <= 1){type = TokenKeyword; this.id =72; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 79 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 82 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 75 ){
if(length <= 4){type = TokenKeyword; this.id =31; length = 4;}
}
}
}
}
else if(val == 82 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 83 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 84 ){
if(length <= 3){type = TokenKeyword; this.id =36; length = 3;}
}
}
else if(val == 69 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 68 ){
if(length <= 3){type = TokenKeyword; this.id =37; length = 3;}
}
}
}
else if(val == 101 ){
if(length <= 1){type = TokenKeyword; this.id =66; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 114 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 104 ){
if(length <= 3){type = TokenKeyword; this.id =41; length = 3;}
}
}
}
else if(val == 99 ){
if(length <= 1){type = TokenKeyword; this.id =44; length = 1;}
const val: u32 = str.charCodeAt(base+1)
if(val == 115 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 116 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 114 ){
if(length <= 4){type = TokenKeyword; this.id =43; length = 4;}
}
}
}
}
else if(val == 114 ){
if(length <= 1){type = TokenKeyword; this.id =46; length = 1;}
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
if(length <= 6){type = TokenKeyword; this.id =45; length = 6;}
}
}
}
}
}
}
else if(val == 102 ){
if(length <= 1){type = TokenKeyword; this.id =49; length = 1;}
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
if(length <= 5){type = TokenKeyword; this.id =56; length = 5;}
}
}
}
}
}
else if(val == 103 ){
if(length <= 1){type = TokenKeyword; this.id =58; length = 1;}
}
else if(val == 116 ){
if(length <= 1){type = TokenKeyword; this.id =60; length = 1;}
}
else if(val == 98 ){
if(length <= 1){type = TokenKeyword; this.id =64; length = 1;}
}
else if(val == 100 ){
if(length <= 1){type = TokenKeyword; this.id =65; length = 1;}
}
else if(val == 66 ){
if(length <= 1){type = TokenKeyword; this.id =68; length = 1;}
}
else if(val == 67 ){
if(length <= 1){type = TokenKeyword; this.id =69; length = 1;}
}
else if(val == 68 ){
if(length <= 1){type = TokenKeyword; this.id =70; length = 1;}
}
        }
        if (type == TypeSymbol || type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base+0)
if(val == 64 ){
type = TokenSymbol; this.id =10 /* @ */; length = 1;
}
else if(val == 34 ){
type = TokenSymbol; this.id =18 /* " */; length = 1;
}
else if(val == 60 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =21 /* <> */; length = 2;
}
}
else if(val == 43 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =22 /* +> */; length = 2;
}
}
else if(val == 603 ){
type = TokenSymbol; this.id =23 /* ɛ */; length = 1;
}
else if(val == 9474 ){
type = TokenSymbol; this.id =24 /* │ */; length = 1;
}
else if(val == 124 ){
type = TokenSymbol; this.id =25 /* | */; length = 1;
}
else if(val == 8594 ){
type = TokenSymbol; this.id =26 /* → */; length = 1;
}
else if(val == 62 ){
type = TokenSymbol; this.id =27 /* > */; length = 1;
}
else if(val == 91 ){
type = TokenSymbol; this.id =28 /* [ */; length = 1;
}
else if(val == 93 ){
type = TokenSymbol; this.id =29 /* ] */; length = 1;
}
else if(val == 40 ){
type = TokenSymbol; this.id =30 /* ( */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 43 ){
type = TokenSymbol; this.id =52 /* (+ */; length = 2;
}
else if(val == 42 ){
type = TokenSymbol; this.id =53 /* (astrix */; length = 2;
}
}
else if(val == 41 ){
type = TokenSymbol; this.id =32 /* ) */; length = 1;
}
else if(val == 94 ){
type = TokenSymbol; this.id =38 /* ^ */; length = 1;
}
else if(val == 123 ){
type = TokenSymbol; this.id =39 /* { */; length = 1;
}
else if(val == 125 ){
type = TokenSymbol; this.id =40 /* } */; length = 1;
}
else if(val == 58 ){
type = TokenSymbol; this.id =42 /* : */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 58 ){
type = TokenSymbol; this.id =62 /* :: */; length = 2;
}
}
else if(val == 61 ){
const val: u32 = str.charCodeAt(base+1)
if(val == 62 ){
type = TokenSymbol; this.id =47 /* => */; length = 2;
}
}
else if(val == 8614 ){
type = TokenSymbol; this.id =48 /* ↦ */; length = 1;
}
else if(val == 35 ){
type = TokenSymbol; this.id =50 /* # */; length = 1;
}
else if(val == 63 ){
type = TokenSymbol; this.id =51 /* ? */; length = 1;
}
else if(val == 36 ){
type = TokenSymbol; this.id =77 /* $ */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 111 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 102 ){
type = TokenSymbol; this.id =54 /* $eof */; length = 4;
}
}
}
}
else if(val == 952 ){
type = TokenSymbol; this.id =57 /* θ */; length = 1;
}
else if(val == 964 ){
type = TokenSymbol; this.id =59 /* τ */; length = 1;
}
else if(val == 92 ){
type = TokenSymbol; this.id =61 /* \ */; length = 1;
}
else if(val == 39 ){
type = TokenSymbol; this.id =73 /* ' */; length = 1;
}
else if(val == 47 ){
type = TokenSymbol; this.id =74 /* / */; length = 1;
}
else if(val == 45 ){
type = TokenSymbol; this.id =75 /* - */; length = 1;
}
else if(val == 95 ){
type = TokenSymbol; this.id =76 /* _ */; length = 1;
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
function _pk(l: Lexer, /* eh, */ skips: StaticArray<u32> = []): Lexer {
    l.next();
    _skip(l, skips);
    return l;
}            

function _skip(l: Lexer, skips: StaticArray<u32>):void{
    while(1){

        
        
        if ((!skips.includes(l.ty) && !skips.includes(l.id)))
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


const const__ = StaticArray.fromArray<u32>([1/* \ws--- */,4/* \nl--- */]),
const_0_ = StaticArray.fromArray<u32>([1/* \ws--- */]),
const_1_ = StaticArray.fromArray<u32>([4/* \nl--- */]),
const_4_ = StaticArray.fromArray<u32>([28/* \[ */,30/* \( */,48/* \↦ */,49/* \f */,55/* \assert */,56/* \shift */,57/* \θ */,58/* \g */,59/* \τ */,60/* \t */,61/* \\ */,76/* \_ */,77/* \$ */]),
const_2_ = StaticArray.fromArray<u32>([23/* \ɛ */,28/* \[ */,48/* \↦ */,49/* \f */,54/* \$eof */,55/* \assert */,56/* \shift */,57/* \θ */,58/* \g */,59/* \τ */,60/* \t */,61/* \\ */,76/* \_ */,77/* \$ */]),
const_3_ = StaticArray.fromArray<u32>([23/* \ɛ */,28/* \[ */,30/* \( */,33/* \EXC */,34/* \ERR */,35/* \IGN */,36/* \RST */,37/* \RED */,39/* \{ */,42/* \: */,48/* \↦ */,49/* \f */,54/* \$eof */,55/* \assert */,56/* \shift */,57/* \θ */,58/* \g */,59/* \τ */,60/* \t */,61/* \\ */,62/* \:: */,76/* \_ */,77/* \$ */]),
_30id0 = (l:Lexer):void => { 
             
            $prd$production(l); stack_ptr++;
             
            },
_30id2 = (l:Lexer):void => { 
             
            $fn$referenced_function(l); stack_ptr++;
             
            },
_30id4 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State34(l);
             
            },
_33id2 = (l:Lexer):void => { 
             
            $cm$comment(l); stack_ptr++;
             
            },
_286id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State35(l);
             
            },
_286id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State36(l);
             
            },
_295id0 = (l:Lexer):void => { 
             
            $pb$production_bodies(l); stack_ptr++;
             
            },
_344id0 = (l:Lexer):void => { 
             
            $pb$production_bodies_group_04_100(l); stack_ptr++;
             
            },
_362id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_111_102(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$production_bodies_group_04_100(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_308id0 = (l:Lexer):void => { 
             
            completeProduction(27,2,28); stack_ptr-=2;
             
            },
_307id0 = (l:Lexer):void => { 
             
            $pb$production_body(l); stack_ptr++;
             
            },
_368id0 = (l:Lexer):void => { 
             
            completeProduction(26,3,28); stack_ptr-=3;
             
            },
_231id0 = (l:Lexer):void => { 
             
            completeProduction(25,1,28); stack_ptr-=1;
             
            },
_101id0 = (l:Lexer):void => { 
             
            $fn$js_primitive(l); stack_ptr++;
             
            },
_101id6 = (l:Lexer):void => { 
             
            $fn$js_data_block(l); stack_ptr++;
             
            },
_101id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State105(l);
             
            },
_105id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,39); stack_ptr-=1;
             
            },
_257id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,39); stack_ptr-=2;
             
            },
_61ty0 = (l:Lexer):void => { 
             
            completeProduction(27,1,47); stack_ptr-=1;
             
            },
_219ty0 = (l:Lexer):void => { 
             
            completeProduction(12,2,47); stack_ptr-=2;
             
            },
_340id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $pb$condition_clause(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_340id1 = (l:Lexer):void => { 
             
            $fn$function_clause(l); stack_ptr++;
             
            },
_340id3 = (l:Lexer):void => { 
             
            $sym$symbol(l); stack_ptr++;
             
            },
_340id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State241(l);
             
            },
_241id0 = (l:Lexer):void => { 
             
            $pb$body_entries(l); stack_ptr++;
             
            },
_242id0 = (l:Lexer):void => { 
             
            $sym$symbol_group_031_105(l); stack_ptr++;
             
            },
_242id2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State314(l);
             
            },
const_5_ = (l:Lexer):void => { 
             
            completeProduction(34,1,31); stack_ptr-=1;
             
            },
_342id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State392(l);
             
            },
_314id0 = (l:Lexer):void => { 
             
            completeProduction(56,2,63); stack_ptr-=2;
             
            },
_315id0 = (l:Lexer):void => { 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            },
_315id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State346(l);
             
            },
_338id0 = (l:Lexer):void => { 
             
            completeProduction(35,2,31); stack_ptr-=2;
             
            },
_392id0 = (l:Lexer):void => { 
             
            completeProduction(36,3,31); stack_ptr-=3;
             
            },
_346id0 = (l:Lexer):void => { 
             
            completeProduction(57,3,63); stack_ptr-=3;
             
            },
_370id0 = (l:Lexer):void => { 
             
            completeProduction(57,4,63); stack_ptr-=4;
             
            },
_261id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State200(l);
             
            },
_261id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State201(l);
             
            },
_261ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State202(l);
             
            },
_261ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State167(l);
             
            },
const_6_ = StaticArray.fromArray<u32>([21/* \<> */,22/* \+> */,24/* \│ */,25/* \| */,26/* \→ */,27/* \> */,29/* \] */,30/* \( */,32/* \) */,38/* \^ */,39/* \{ */,40/* \} */,48/* \↦ */,49/* \f */,50/* \# */,51/* \? */,52/* \(+ */,53/* \(* */,54/* \$eof */,55/* \assert */,56/* \shift */,57/* \θ */,58/* \g */,59/* \τ */,60/* \t */,61/* \\ */,62/* \:: */]),
_200id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,101); stack_ptr-=1;
             
            },
_262id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State268(l);
             
            },
_262id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State269(l);
             
            },
_262ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State266(l);
             
            },
_262ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State267(l);
             
            },
_262ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State270(l);
             
            },
_262ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State271(l);
             
            },
_262ty4 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State272(l);
             
            },
_262ty5 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State273(l);
             
            },
_266id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,101); stack_ptr-=2;
             
            },
_311id0 = (l:Lexer):void => { 
             
            $sym$generated_symbol(l); stack_ptr++;
             
            },
_311id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$imported_production_symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$production_symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_311id4 = (l:Lexer):void => { 
             
            $sym$literal_symbol(l); stack_ptr++;
             
            },
_311id6 = (l:Lexer):void => { 
             
            $sym$escaped_symbol(l); stack_ptr++;
             
            },
_311id7 = (l:Lexer):void => { 
             
            $sym$assert_function_symbol(l); stack_ptr++;
             
            },
_311id9 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State312(l);
             
            },
_311ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State250(l);
             
            },
_311ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State251(l);
             
            },
const_7_ = StaticArray.fromArray<u32>([21/* \<> */,22/* \+> */,24/* \│ */,25/* \| */,29/* \] */,30/* \( */,32/* \) */,48/* \↦ */,49/* \f */,50/* \# */,55/* \assert */,56/* \shift */,57/* \θ */,58/* \g */,59/* \τ */,60/* \t */,61/* \\ */,76/* \_ */,77/* \$ */]),
_250id0 = (l:Lexer):void => { 
             
            completeProduction(54,1,63); stack_ptr-=1;
             
            },
_246id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            },
_236id0 = (l:Lexer):void => { 
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
_234id0 = (l:Lexer):void => { 
             
            completeProduction(29,1,29); stack_ptr-=1;
             
            },
_354id3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State376(l);
             
            },
_335id0 = (l:Lexer):void => { 
             
            completeProduction(30,2,30); stack_ptr-=2;
             
            },
_376id0 = (l:Lexer):void => { 
             
            completeProduction(55,3,63); stack_ptr-=3;
             
            },
_86id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,50); stack_ptr-=1;
             
            },
_227id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,50); stack_ptr-=2;
             
            };
const idm30: Map<number, (L:Lexer)=>void> = new Map()
idm30.set(21/* <> */,_30id0)
idm30.set(22/* +> */,_30id0)
idm30.set(48/* ↦ */,_30id2)
idm30.set(49/* f */,_30id2)
idm30.set(23/* ɛ */,_30id4);
const idm33: Map<number, (L:Lexer)=>void> = new Map()
idm33.set(21/* <> */,_30id0)
idm33.set(22/* +> */,_30id0)
idm33.set(50/* # */,_33id2)
idm33.set(48/* ↦ */,_30id2)
idm33.set(49/* f */,_30id2);
const idm286: Map<number, (L:Lexer)=>void> = new Map()
idm286.set(21/* <> */,_286id0)
idm286.set(22/* +> */,_286id1);
const idm295: Map<number, (L:Lexer)=>void> = new Map()
idm295.set(30/* ( */,_295id0)
idm295.set(48/* ↦ */,_295id0)
idm295.set(49/* f */,_295id0)
idm295.set(28/* [ */,_295id0)
idm295.set(57/* θ */,_295id0)
idm295.set(58/* g */,_295id0)
idm295.set(76/* _ */,_295id0)
idm295.set(77/* $ */,_295id0)
idm295.set(59/* τ */,_295id0)
idm295.set(60/* t */,_295id0)
idm295.set(61/* \ */,_295id0)
idm295.set(55/* assert */,_295id0)
idm295.set(56/* shift */,_295id0)
idm295.set(23/* ɛ */,_295id0)
idm295.set(54/* $eof */,_295id0);
const idm344: Map<number, (L:Lexer)=>void> = new Map()
idm344.set(24/* │ */,_344id0)
idm344.set(25/* | */,_344id0)
idm344.set(50/* # */,_33id2);
const idm362: Map<number, (L:Lexer)=>void> = new Map()
idm362.set(24/* │ */,_362id0)
idm362.set(25/* | */,_362id0)
idm362.set(50/* # */,_33id2);
const idm308r: Map<number, (L:Lexer)=>void> = new Map()
idm308r.set(24/* │ */,_308id0)
idm308r.set(25/* | */,_308id0)
idm308r.set(50/* # */,_308id0)
idm308r.set(32/* ) */,_308id0)
idm308r.set(21/* <> */,_308id0)
idm308r.set(22/* +> */,_308id0)
idm308r.set(48/* ↦ */,_308id0)
idm308r.set(49/* f */,_308id0);
const idm307: Map<number, (L:Lexer)=>void> = new Map()
idm307.set(30/* ( */,_307id0)
idm307.set(48/* ↦ */,_307id0)
idm307.set(49/* f */,_307id0)
idm307.set(28/* [ */,_307id0)
idm307.set(57/* θ */,_307id0)
idm307.set(58/* g */,_307id0)
idm307.set(76/* _ */,_307id0)
idm307.set(77/* $ */,_307id0)
idm307.set(59/* τ */,_307id0)
idm307.set(60/* t */,_307id0)
idm307.set(61/* \ */,_307id0)
idm307.set(55/* assert */,_307id0)
idm307.set(56/* shift */,_307id0)
idm307.set(23/* ɛ */,_307id0)
idm307.set(54/* $eof */,_307id0);
const idm368r: Map<number, (L:Lexer)=>void> = new Map()
idm368r.set(24/* │ */,_368id0)
idm368r.set(25/* | */,_368id0)
idm368r.set(50/* # */,_368id0)
idm368r.set(32/* ) */,_368id0)
idm368r.set(21/* <> */,_368id0)
idm368r.set(22/* +> */,_368id0)
idm368r.set(48/* ↦ */,_368id0)
idm368r.set(49/* f */,_368id0);
const idm231r: Map<number, (L:Lexer)=>void> = new Map()
idm231r.set(24/* │ */,_231id0)
idm231r.set(25/* | */,_231id0)
idm231r.set(50/* # */,_231id0)
idm231r.set(32/* ) */,_231id0)
idm231r.set(21/* <> */,_231id0)
idm231r.set(22/* +> */,_231id0)
idm231r.set(48/* ↦ */,_231id0)
idm231r.set(49/* f */,_231id0);
const idm101: Map<number, (L:Lexer)=>void> = new Map()
idm101.set(57/* θ */,_101id0)
idm101.set(58/* g */,_101id0)
idm101.set(59/* τ */,_101id0)
idm101.set(60/* t */,_101id0)
idm101.set(61/* \ */,_101id0)
idm101.set(54/* $eof */,_101id0)
idm101.set(39/* { */,_101id6)
idm101.set(23/* ɛ */,_101id7);
const idm105r: Map<number, (L:Lexer)=>void> = new Map()
idm105r.set(40/* } */,_105id0)
idm105r.set(57/* θ */,_105id0)
idm105r.set(58/* g */,_105id0)
idm105r.set(59/* τ */,_105id0)
idm105r.set(60/* t */,_105id0)
idm105r.set(61/* \ */,_105id0)
idm105r.set(54/* $eof */,_105id0)
idm105r.set(39/* { */,_105id0);
const idm104: Map<number, (L:Lexer)=>void> = new Map()
idm104.set(57/* θ */,_101id0)
idm104.set(58/* g */,_101id0)
idm104.set(59/* τ */,_101id0)
idm104.set(60/* t */,_101id0)
idm104.set(61/* \ */,_101id0)
idm104.set(54/* $eof */,_101id0)
idm104.set(39/* { */,_101id6);
const idm257r: Map<number, (L:Lexer)=>void> = new Map()
idm257r.set(40/* } */,_257id0)
idm257r.set(57/* θ */,_257id0)
idm257r.set(58/* g */,_257id0)
idm257r.set(59/* τ */,_257id0)
idm257r.set(60/* t */,_257id0)
idm257r.set(61/* \ */,_257id0)
idm257r.set(54/* $eof */,_257id0)
idm257r.set(39/* { */,_257id0);
const tym61r: Map<number, (L:Lexer)=>void> = new Map()
tym61r.set(4/* \nl--- */,_61ty0)
tym61r.set(6/* \sym--- */,_61ty0)
tym61r.set(5/* \tok--- */,_61ty0)
tym61r.set(3/* \id--- */,_61ty0)
tym61r.set(2/* \num--- */,_61ty0)
tym61r.set(1/* \ws--- */,_61ty0)
tym61r.set(7/* \key--- */,_61ty0)
tym61r.set(0 /*--*//* EOF */,_61ty0);
const tym219r: Map<number, (L:Lexer)=>void> = new Map()
tym219r.set(4/* \nl--- */,_219ty0)
tym219r.set(6/* \sym--- */,_219ty0)
tym219r.set(5/* \tok--- */,_219ty0)
tym219r.set(3/* \id--- */,_219ty0)
tym219r.set(2/* \num--- */,_219ty0)
tym219r.set(1/* \ws--- */,_219ty0)
tym219r.set(7/* \key--- */,_219ty0)
tym219r.set(0 /*--*//* EOF */,_219ty0);
const idm340: Map<number, (L:Lexer)=>void> = new Map()
idm340.set(30/* ( */,_340id0)
idm340.set(48/* ↦ */,_340id1)
idm340.set(49/* f */,_340id1)
idm340.set(57/* θ */,_340id3)
idm340.set(58/* g */,_340id3)
idm340.set(76/* _ */,_340id3)
idm340.set(77/* $ */,_340id3)
idm340.set(59/* τ */,_340id3)
idm340.set(60/* t */,_340id3)
idm340.set(61/* \ */,_340id3)
idm340.set(55/* assert */,_340id3)
idm340.set(56/* shift */,_340id3)
idm340.set(28/* [ */,_340id12);
const idm241: Map<number, (L:Lexer)=>void> = new Map()
idm241.set(30/* ( */,_241id0)
idm241.set(48/* ↦ */,_241id0)
idm241.set(49/* f */,_241id0)
idm241.set(28/* [ */,_241id0)
idm241.set(57/* θ */,_241id0)
idm241.set(58/* g */,_241id0)
idm241.set(76/* _ */,_241id0)
idm241.set(77/* $ */,_241id0)
idm241.set(59/* τ */,_241id0)
idm241.set(60/* t */,_241id0)
idm241.set(61/* \ */,_241id0)
idm241.set(55/* assert */,_241id0)
idm241.set(56/* shift */,_241id0);
const idm242: Map<number, (L:Lexer)=>void> = new Map()
idm242.set(52/* (+ */,_242id0)
idm242.set(53/* (* */,_242id0)
idm242.set(51/* ? */,_242id2);
const idm242r: Map<number, (L:Lexer)=>void> = new Map()
idm242r.set(48/* ↦ */,const_5_)
idm242r.set(49/* f */,const_5_)
idm242r.set(30/* ( */,const_5_)
idm242r.set(57/* θ */,const_5_)
idm242r.set(58/* g */,const_5_)
idm242r.set(76/* _ */,const_5_)
idm242r.set(77/* $ */,const_5_)
idm242r.set(59/* τ */,const_5_)
idm242r.set(60/* t */,const_5_)
idm242r.set(61/* \ */,const_5_)
idm242r.set(55/* assert */,const_5_)
idm242r.set(56/* shift */,const_5_)
idm242r.set(24/* │ */,const_5_)
idm242r.set(25/* | */,const_5_)
idm242r.set(50/* # */,const_5_)
idm242r.set(32/* ) */,const_5_)
idm242r.set(21/* <> */,const_5_)
idm242r.set(22/* +> */,const_5_)
idm242r.set(29/* ] */,const_5_);
const idm341: Map<number, (L:Lexer)=>void> = new Map()
idm341.set(48/* ↦ */,_340id1)
idm341.set(49/* f */,_340id1)
idm341.set(30/* ( */,_340id0)
idm341.set(57/* θ */,_340id3)
idm341.set(58/* g */,_340id3)
idm341.set(76/* _ */,_340id3)
idm341.set(77/* $ */,_340id3)
idm341.set(59/* τ */,_340id3)
idm341.set(60/* t */,_340id3)
idm341.set(61/* \ */,_340id3)
idm341.set(55/* assert */,_340id3)
idm341.set(56/* shift */,_340id3);
const idm342: Map<number, (L:Lexer)=>void> = new Map()
idm342.set(48/* ↦ */,_340id1)
idm342.set(49/* f */,_340id1)
idm342.set(30/* ( */,_340id0)
idm342.set(57/* θ */,_340id3)
idm342.set(58/* g */,_340id3)
idm342.set(76/* _ */,_340id3)
idm342.set(77/* $ */,_340id3)
idm342.set(59/* τ */,_340id3)
idm342.set(60/* t */,_340id3)
idm342.set(61/* \ */,_340id3)
idm342.set(55/* assert */,_340id3)
idm342.set(56/* shift */,_340id3)
idm342.set(29/* ] */,_342id12);
const idm314r: Map<number, (L:Lexer)=>void> = new Map()
idm314r.set(57/* θ */,_314id0)
idm314r.set(51/* ? */,_314id0)
idm314r.set(52/* (+ */,_314id0)
idm314r.set(53/* (* */,_314id0)
idm314r.set(58/* g */,_314id0)
idm314r.set(76/* _ */,_314id0)
idm314r.set(77/* $ */,_314id0)
idm314r.set(59/* τ */,_314id0)
idm314r.set(60/* t */,_314id0)
idm314r.set(61/* \ */,_314id0)
idm314r.set(55/* assert */,_314id0)
idm314r.set(56/* shift */,_314id0)
idm314r.set(30/* ( */,_314id0)
idm314r.set(48/* ↦ */,_314id0)
idm314r.set(49/* f */,_314id0)
idm314r.set(24/* │ */,_314id0)
idm314r.set(25/* | */,_314id0)
idm314r.set(50/* # */,_314id0)
idm314r.set(32/* ) */,_314id0)
idm314r.set(21/* <> */,_314id0)
idm314r.set(22/* +> */,_314id0)
idm314r.set(29/* ] */,_314id0);
const idm315: Map<number, (L:Lexer)=>void> = new Map()
idm315.set(57/* θ */,_315id0)
idm315.set(58/* g */,_315id0)
idm315.set(59/* τ */,_315id0)
idm315.set(60/* t */,_315id0)
idm315.set(61/* \ */,_315id0)
idm315.set(55/* assert */,_315id0)
idm315.set(56/* shift */,_315id0)
idm315.set(32/* ) */,_315id7);
const idm338r: Map<number, (L:Lexer)=>void> = new Map()
idm338r.set(48/* ↦ */,_338id0)
idm338r.set(49/* f */,_338id0)
idm338r.set(30/* ( */,_338id0)
idm338r.set(57/* θ */,_338id0)
idm338r.set(58/* g */,_338id0)
idm338r.set(76/* _ */,_338id0)
idm338r.set(77/* $ */,_338id0)
idm338r.set(59/* τ */,_338id0)
idm338r.set(60/* t */,_338id0)
idm338r.set(61/* \ */,_338id0)
idm338r.set(55/* assert */,_338id0)
idm338r.set(56/* shift */,_338id0)
idm338r.set(24/* │ */,_338id0)
idm338r.set(25/* | */,_338id0)
idm338r.set(50/* # */,_338id0)
idm338r.set(32/* ) */,_338id0)
idm338r.set(21/* <> */,_338id0)
idm338r.set(22/* +> */,_338id0)
idm338r.set(29/* ] */,_338id0);
const idm392r: Map<number, (L:Lexer)=>void> = new Map()
idm392r.set(29/* ] */,_392id0)
idm392r.set(48/* ↦ */,_392id0)
idm392r.set(49/* f */,_392id0)
idm392r.set(30/* ( */,_392id0)
idm392r.set(57/* θ */,_392id0)
idm392r.set(58/* g */,_392id0)
idm392r.set(76/* _ */,_392id0)
idm392r.set(77/* $ */,_392id0)
idm392r.set(59/* τ */,_392id0)
idm392r.set(60/* t */,_392id0)
idm392r.set(61/* \ */,_392id0)
idm392r.set(55/* assert */,_392id0)
idm392r.set(56/* shift */,_392id0)
idm392r.set(24/* │ */,_392id0)
idm392r.set(25/* | */,_392id0)
idm392r.set(50/* # */,_392id0)
idm392r.set(32/* ) */,_392id0)
idm392r.set(21/* <> */,_392id0)
idm392r.set(22/* +> */,_392id0);
const idm346r: Map<number, (L:Lexer)=>void> = new Map()
idm346r.set(57/* θ */,_346id0)
idm346r.set(51/* ? */,_346id0)
idm346r.set(52/* (+ */,_346id0)
idm346r.set(53/* (* */,_346id0)
idm346r.set(58/* g */,_346id0)
idm346r.set(76/* _ */,_346id0)
idm346r.set(77/* $ */,_346id0)
idm346r.set(59/* τ */,_346id0)
idm346r.set(60/* t */,_346id0)
idm346r.set(61/* \ */,_346id0)
idm346r.set(55/* assert */,_346id0)
idm346r.set(56/* shift */,_346id0)
idm346r.set(30/* ( */,_346id0)
idm346r.set(48/* ↦ */,_346id0)
idm346r.set(49/* f */,_346id0)
idm346r.set(24/* │ */,_346id0)
idm346r.set(25/* | */,_346id0)
idm346r.set(50/* # */,_346id0)
idm346r.set(32/* ) */,_346id0)
idm346r.set(21/* <> */,_346id0)
idm346r.set(22/* +> */,_346id0)
idm346r.set(29/* ] */,_346id0);
const idm370r: Map<number, (L:Lexer)=>void> = new Map()
idm370r.set(57/* θ */,_370id0)
idm370r.set(51/* ? */,_370id0)
idm370r.set(52/* (+ */,_370id0)
idm370r.set(53/* (* */,_370id0)
idm370r.set(58/* g */,_370id0)
idm370r.set(76/* _ */,_370id0)
idm370r.set(77/* $ */,_370id0)
idm370r.set(59/* τ */,_370id0)
idm370r.set(60/* t */,_370id0)
idm370r.set(61/* \ */,_370id0)
idm370r.set(55/* assert */,_370id0)
idm370r.set(56/* shift */,_370id0)
idm370r.set(30/* ( */,_370id0)
idm370r.set(48/* ↦ */,_370id0)
idm370r.set(49/* f */,_370id0)
idm370r.set(24/* │ */,_370id0)
idm370r.set(25/* | */,_370id0)
idm370r.set(50/* # */,_370id0)
idm370r.set(32/* ) */,_370id0)
idm370r.set(21/* <> */,_370id0)
idm370r.set(22/* +> */,_370id0)
idm370r.set(29/* ] */,_370id0);
const idm261: Map<number, (L:Lexer)=>void> = new Map()
idm261.set(76/* _ */,_261id0)
idm261.set(77/* $ */,_261id1);
const tym261: Map<number, (L:Lexer)=>void> = new Map()
tym261.set(3/* \id--- */,_261ty0)
tym261.set(7/* \key--- */,_261ty1);
const idm200r: Map<number, (L:Lexer)=>void> = new Map()
idm200r.set(26/* → */,_200id0)
idm200r.set(76/* _ */,_200id0)
idm200r.set(77/* $ */,_200id0)
idm200r.set(27/* > */,_200id0)
idm200r.set(62/* :: */,_200id0)
idm200r.set(38/* ^ */,_200id0)
idm200r.set(39/* { */,_200id0)
idm200r.set(57/* θ */,_200id0)
idm200r.set(58/* g */,_200id0)
idm200r.set(59/* τ */,_200id0)
idm200r.set(60/* t */,_200id0)
idm200r.set(61/* \ */,_200id0)
idm200r.set(54/* $eof */,_200id0)
idm200r.set(55/* assert */,_200id0)
idm200r.set(56/* shift */,_200id0)
idm200r.set(32/* ) */,_200id0)
idm200r.set(51/* ? */,_200id0)
idm200r.set(52/* (+ */,_200id0)
idm200r.set(53/* (* */,_200id0)
idm200r.set(30/* ( */,_200id0)
idm200r.set(48/* ↦ */,_200id0)
idm200r.set(49/* f */,_200id0)
idm200r.set(24/* │ */,_200id0)
idm200r.set(25/* | */,_200id0)
idm200r.set(50/* # */,_200id0)
idm200r.set(21/* <> */,_200id0)
idm200r.set(22/* +> */,_200id0)
idm200r.set(40/* } */,_200id0)
idm200r.set(29/* ] */,_200id0);
const tym200r: Map<number, (L:Lexer)=>void> = new Map()
tym200r.set(3/* \id--- */,_200id0)
tym200r.set(7/* \key--- */,_200id0)
tym200r.set(2/* \num--- */,_200id0)
tym200r.set(6/* \hex--- */,_200id0)
tym200r.set(6/* \bin--- */,_200id0)
tym200r.set(6/* \oct--- */,_200id0)
tym200r.set(6/* \sym--- */,_200id0)
tym200r.set(5/* \tok--- */,_200id0)
tym200r.set(4/* \nl--- */,_200id0)
tym200r.set(0 /*--*//* EOF */,_200id0)
tym200r.set(1/* \ws--- */,_200id0)
tym200r.set(6/* \sci--- */,_200id0)
tym200r.set(6/* \flt--- */,_200id0);
const idm262: Map<number, (L:Lexer)=>void> = new Map()
idm262.set(76/* _ */,_262id0)
idm262.set(77/* $ */,_262id1);
const tym262: Map<number, (L:Lexer)=>void> = new Map()
tym262.set(3/* \id--- */,_262ty0)
tym262.set(7/* \key--- */,_262ty1)
tym262.set(2/* \num--- */,_262ty2)
tym262.set(6/* \hex--- */,_262ty3)
tym262.set(6/* \bin--- */,_262ty4)
tym262.set(6/* \oct--- */,_262ty5);
const idm266r: Map<number, (L:Lexer)=>void> = new Map()
idm266r.set(76/* _ */,_266id0)
idm266r.set(77/* $ */,_266id0)
idm266r.set(26/* → */,_266id0)
idm266r.set(27/* > */,_266id0)
idm266r.set(62/* :: */,_266id0)
idm266r.set(38/* ^ */,_266id0)
idm266r.set(39/* { */,_266id0)
idm266r.set(57/* θ */,_266id0)
idm266r.set(58/* g */,_266id0)
idm266r.set(59/* τ */,_266id0)
idm266r.set(60/* t */,_266id0)
idm266r.set(61/* \ */,_266id0)
idm266r.set(54/* $eof */,_266id0)
idm266r.set(55/* assert */,_266id0)
idm266r.set(56/* shift */,_266id0)
idm266r.set(32/* ) */,_266id0)
idm266r.set(51/* ? */,_266id0)
idm266r.set(52/* (+ */,_266id0)
idm266r.set(53/* (* */,_266id0)
idm266r.set(30/* ( */,_266id0)
idm266r.set(48/* ↦ */,_266id0)
idm266r.set(49/* f */,_266id0)
idm266r.set(24/* │ */,_266id0)
idm266r.set(25/* | */,_266id0)
idm266r.set(50/* # */,_266id0)
idm266r.set(21/* <> */,_266id0)
idm266r.set(22/* +> */,_266id0)
idm266r.set(40/* } */,_266id0)
idm266r.set(29/* ] */,_266id0);
const tym266r: Map<number, (L:Lexer)=>void> = new Map()
tym266r.set(3/* \id--- */,_266id0)
tym266r.set(7/* \key--- */,_266id0)
tym266r.set(2/* \num--- */,_266id0)
tym266r.set(6/* \hex--- */,_266id0)
tym266r.set(6/* \bin--- */,_266id0)
tym266r.set(6/* \oct--- */,_266id0)
tym266r.set(6/* \sci--- */,_266id0)
tym266r.set(6/* \flt--- */,_266id0)
tym266r.set(0 /*--*//* EOF */,_266id0)
tym266r.set(6/* \sym--- */,_266id0)
tym266r.set(5/* \tok--- */,_266id0)
tym266r.set(4/* \nl--- */,_266id0)
tym266r.set(1/* \ws--- */,_266id0);
const idm311: Map<number, (L:Lexer)=>void> = new Map()
idm311.set(57/* θ */,_311id0)
idm311.set(58/* g */,_311id0)
idm311.set(76/* _ */,_311id2)
idm311.set(77/* $ */,_311id2)
idm311.set(59/* τ */,_311id4)
idm311.set(60/* t */,_311id4)
idm311.set(61/* \ */,_311id6)
idm311.set(55/* assert */,_311id7)
idm311.set(56/* shift */,_311id7)
idm311.set(30/* ( */,_311id9);
const tym311: Map<number, (L:Lexer)=>void> = new Map()
tym311.set(3/* \id--- */,_311id2)
tym311.set(7/* \key--- */,_311id2)
tym311.set(6/* \sym--- */,_311ty2)
tym311.set(5/* \tok--- */,_311ty3);
const idm250r: Map<number, (L:Lexer)=>void> = new Map()
idm250r.set(57/* θ */,_250id0)
idm250r.set(51/* ? */,_250id0)
idm250r.set(52/* (+ */,_250id0)
idm250r.set(53/* (* */,_250id0)
idm250r.set(58/* g */,_250id0)
idm250r.set(76/* _ */,_250id0)
idm250r.set(77/* $ */,_250id0)
idm250r.set(59/* τ */,_250id0)
idm250r.set(60/* t */,_250id0)
idm250r.set(61/* \ */,_250id0)
idm250r.set(55/* assert */,_250id0)
idm250r.set(56/* shift */,_250id0)
idm250r.set(30/* ( */,_250id0)
idm250r.set(48/* ↦ */,_250id0)
idm250r.set(49/* f */,_250id0)
idm250r.set(24/* │ */,_250id0)
idm250r.set(25/* | */,_250id0)
idm250r.set(50/* # */,_250id0)
idm250r.set(32/* ) */,_250id0)
idm250r.set(21/* <> */,_250id0)
idm250r.set(22/* +> */,_250id0)
idm250r.set(29/* ] */,_250id0);
const idm246r: Map<number, (L:Lexer)=>void> = new Map()
idm246r.set(57/* θ */,_246id0)
idm246r.set(51/* ? */,_246id0)
idm246r.set(52/* (+ */,_246id0)
idm246r.set(53/* (* */,_246id0)
idm246r.set(58/* g */,_246id0)
idm246r.set(76/* _ */,_246id0)
idm246r.set(77/* $ */,_246id0)
idm246r.set(59/* τ */,_246id0)
idm246r.set(60/* t */,_246id0)
idm246r.set(61/* \ */,_246id0)
idm246r.set(55/* assert */,_246id0)
idm246r.set(56/* shift */,_246id0)
idm246r.set(30/* ( */,_246id0)
idm246r.set(48/* ↦ */,_246id0)
idm246r.set(49/* f */,_246id0)
idm246r.set(24/* │ */,_246id0)
idm246r.set(25/* | */,_246id0)
idm246r.set(50/* # */,_246id0)
idm246r.set(32/* ) */,_246id0)
idm246r.set(21/* <> */,_246id0)
idm246r.set(22/* +> */,_246id0)
idm246r.set(29/* ] */,_246id0);
const idm236: Map<number, (L:Lexer)=>void> = new Map()
idm236.set(48/* ↦ */,_236id0)
idm236.set(49/* f */,_236id0)
idm236.set(30/* ( */,_340id0)
idm236.set(57/* θ */,_340id3)
idm236.set(58/* g */,_340id3)
idm236.set(76/* _ */,_340id3)
idm236.set(77/* $ */,_340id3)
idm236.set(59/* τ */,_340id3)
idm236.set(60/* t */,_340id3)
idm236.set(61/* \ */,_340id3)
idm236.set(55/* assert */,_340id3)
idm236.set(56/* shift */,_340id3);
const idm236r: Map<number, (L:Lexer)=>void> = new Map()
idm236r.set(48/* ↦ */,const_8_)
idm236r.set(49/* f */,const_8_)
idm236r.set(24/* │ */,const_8_)
idm236r.set(25/* | */,const_8_)
idm236r.set(50/* # */,const_8_)
idm236r.set(32/* ) */,const_8_)
idm236r.set(21/* <> */,const_8_)
idm236r.set(22/* +> */,const_8_);
const idm234r: Map<number, (L:Lexer)=>void> = new Map()
idm234r.set(24/* │ */,_234id0)
idm234r.set(25/* | */,_234id0)
idm234r.set(50/* # */,_234id0)
idm234r.set(32/* ) */,_234id0)
idm234r.set(21/* <> */,_234id0)
idm234r.set(22/* +> */,_234id0)
idm234r.set(48/* ↦ */,_234id0)
idm234r.set(49/* f */,_234id0);
const idm354: Map<number, (L:Lexer)=>void> = new Map()
idm354.set(24/* │ */,_344id0)
idm354.set(25/* | */,_344id0)
idm354.set(50/* # */,_33id2)
idm354.set(32/* ) */,_354id3);
const idm335r: Map<number, (L:Lexer)=>void> = new Map()
idm335r.set(24/* │ */,_335id0)
idm335r.set(25/* | */,_335id0)
idm335r.set(50/* # */,_335id0)
idm335r.set(32/* ) */,_335id0)
idm335r.set(21/* <> */,_335id0)
idm335r.set(22/* +> */,_335id0)
idm335r.set(48/* ↦ */,_335id0)
idm335r.set(49/* f */,_335id0);
const idm376r: Map<number, (L:Lexer)=>void> = new Map()
idm376r.set(57/* θ */,_376id0)
idm376r.set(51/* ? */,_376id0)
idm376r.set(52/* (+ */,_376id0)
idm376r.set(53/* (* */,_376id0)
idm376r.set(58/* g */,_376id0)
idm376r.set(76/* _ */,_376id0)
idm376r.set(77/* $ */,_376id0)
idm376r.set(59/* τ */,_376id0)
idm376r.set(60/* t */,_376id0)
idm376r.set(61/* \ */,_376id0)
idm376r.set(55/* assert */,_376id0)
idm376r.set(56/* shift */,_376id0)
idm376r.set(30/* ( */,_376id0)
idm376r.set(48/* ↦ */,_376id0)
idm376r.set(49/* f */,_376id0)
idm376r.set(24/* │ */,_376id0)
idm376r.set(25/* | */,_376id0)
idm376r.set(50/* # */,_376id0)
idm376r.set(32/* ) */,_376id0)
idm376r.set(21/* <> */,_376id0)
idm376r.set(22/* +> */,_376id0)
idm376r.set(29/* ] */,_376id0);
const idm86r: Map<number, (L:Lexer)=>void> = new Map()
idm86r.set(32/* ) */,_86id0)
idm86r.set(57/* θ */,_86id0)
idm86r.set(58/* g */,_86id0)
idm86r.set(59/* τ */,_86id0)
idm86r.set(60/* t */,_86id0)
idm86r.set(61/* \ */,_86id0)
idm86r.set(55/* assert */,_86id0)
idm86r.set(56/* shift */,_86id0);
const idm227r: Map<number, (L:Lexer)=>void> = new Map()
idm227r.set(32/* ) */,_227id0)
idm227r.set(57/* θ */,_227id0)
idm227r.set(58/* g */,_227id0)
idm227r.set(59/* τ */,_227id0)
idm227r.set(60/* t */,_227id0)
idm227r.set(61/* \ */,_227id0)
idm227r.set(55/* assert */,_227id0)
idm227r.set(56/* shift */,_227id0);
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
prd$productions=>• ɛ
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
//considered syms: @,#,ɛ,<>,+>,↦,f

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
prd$productions=>• ɛ
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
if(l.id == 10/* \@ */||l.id == 50/* \# */){
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
} else if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 23/* \ɛ */||l.id == 48/* \↦ */||l.id == 49/* \f */){
 //considered syms: ɛ,<>,+>,↦,f

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
if(l.id == 10/* \@ */){
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

if(!FAILED &&  pk1.id == 13/* \IGNORE */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 11/* \SYMBOL */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 12/* \PREC */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 15/* \NAME */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 16/* \EXT */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 14/* \ERROR */){
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
setProduction(4)

return;
}
} else if(!FAILED &&  pk1.id == 17/* \IMPORT */){
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
setProduction(4)

return;
}
}
} else if(l.id == 50/* \# */){
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
setProduction(4)

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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 11/* \SYMBOL--- */);
if(!FAILED){
$pre$symbols_preamble_HC_listbody2_101(l)
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
if(!FAILED){
setProduction(6)
add_reduce(4,6);
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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 12/* \PREC--- */);
if(!FAILED){
$sym$terminal_symbol(l)
if(!FAILED){
_with_skip(l, const_0_, 2/* \num--- */);
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 13/* \IGNORE--- */);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
if(!FAILED){
setProduction(8)
add_reduce(4,8);
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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 14/* \ERROR--- */);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
if(!FAILED){
setProduction(9)
add_reduce(4,9);
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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 15/* \NAME--- */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
if(!FAILED){
setProduction(10)
add_reduce(4,10);
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
_with_skip(l, const__, 10/* \@--- */);
if(!FAILED){
_with_skip(l, const__, 16/* \EXT--- */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4/* \nl--- */);
if(!FAILED){
setProduction(11)
add_reduce(4,11);
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
if(l.ty == 3/* \id--- */){
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
setProduction(13)

return;
}
} else if(l.ty == 7/* \key--- */){
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
setProduction(13)

return;
}
} else if(l.ty == 6/* \sym--- */){
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
setProduction(13)

return;
}
} else if(l.ty == 5/* \tok--- */){
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
setProduction(13)

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
if(l.id == 19/* \AS */){
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
setProduction(16)

return;
}
} else if(l.id == 20/* \as */){
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
setProduction(16)

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
_with_skip(l, const_1_, 17/* \IMPORT--- */);

//Look Ahead Level 0
/*
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
*/
_skip(l, const_1_)
if(l.ty == 1/* \ws--- */){
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
_with_skip(l, const__, 4/* \nl--- */);
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
} else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){
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
_with_skip(l, const__, 4/* \nl--- */);
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
setProduction(20)
add_reduce(1,19);
return;
}
fail(l);}
    function $prd$production_group_010_101(l:Lexer) :void{//Production Start
/*
prd$production_group_010_101=>• │
prd$production_group_010_101=>• |
*/
_skip(l, const__)
if(l.id == 24/* \│ */){
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
setProduction(21)

return;
}
} else if(l.id == 25/* \| */){
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
setProduction(21)

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
setProduction(22)
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
setProduction(23)
add_reduce(1,20);
return;
}
fail(l);}
    
    function $prd$production_start_symbol(l:Lexer) :void{//Production Start
/*
prd$production_start_symbol=>• →
prd$production_start_symbol=>• >
*/
_skip(l, const__)
if(l.id == 26/* \→ */){
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
setProduction(25)

return;
}
} else if(l.id == 27/* \> */){
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
setProduction(25)

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
if(l.id == 24/* \│ */){
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
setProduction(27)

return;
}
} else if(l.id == 25/* \| */){
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
setProduction(27)

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
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
pb$body_entries=>• sym$symbol
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
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
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(const_2_.includes(l.id)||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){
 //considered syms: [,↦,f,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,ɛ,$eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$production_body=>• pb$entries
*/
$pb$entries(l)
if(!FAILED){
setProduction(29)
add_reduce(1,29);
return;
}
} else if(l.id == 30/* \( */){
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
pb$condition_clause=>( • τEXC sym$condition_symbol_list )
pb$condition_clause=>( • τERR sym$condition_symbol_list )
pb$condition_clause=>( • τIGN sym$condition_symbol_list )
pb$condition_clause=>( • τRST sym$condition_symbol_list )
pb$condition_clause=>( • τRED sym$symbol )
fn$js_function_start_symbol=>τf • :
fn$function_clause=>fn$js_function_start_symbol • { fn$js_data }
pb$body_entries=>• [ pb$body_entries ]
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
def$js_id_symbols=>• _
def$js_id_symbols=>• $
def$js_id_symbols=>• θid
def$js_id_symbols=>• θkey
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$generated_symbol_group_140_106=>τg • :
sym$imported_production_symbol=>sym$production_id • :: sym$identifier
sym$literal_symbol_group_143_107=>τt • :
def$natural=>• θnum
sym$grouped_symbol_group_013_103=>• θsym
sym$grouped_symbol_group_013_103=>• θid
sym$grouped_symbol_group_013_103=>• θtok
sym$grouped_symbol_group_013_103=>• θkey
sym$assert_function_symbol=>τassert • : sym$identifier
sym$assert_function_symbol=>τshift • : sym$identifier
pb$force_fork=>• ( τFORK )
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof*/

/*pb$production_body=>• pb$entries peek 1 state: 
pb$production_body=>• pb$entries
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• sym$empty_symbol
pb$entries=>• sym$EOF_symbol
pb$entries=>• pb$body_entries
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
pb$body_entries=>• sym$symbol
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
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
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof*/

if(!FAILED &&  const_3_.includes(pk1.id)||pk1.ty == 2/* \num--- */||pk1.ty == 3/* \id--- */||pk1.ty == 5/* \tok--- */||pk1.ty == 6/* \sym--- */||pk1.ty == 7/* \key--- */){
 //considered syms: EXC,ERR,IGN,RST,RED,:,{,[,(,↦,f,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,::,num,ɛ,$eof

//Single Production Completion

//peek 1

//block 3

//groups true
/*
pb$production_body=>• pb$entries
*/
$pb$entries(l)
if(!FAILED){
setProduction(29)
add_reduce(1,29);
return;
}
} else if(!FAILED &&  pk1.id == 31/* \FORK */){
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
setProduction(29)
add_reduce(2,28);
return;
}
}
}
}
fail(l);}
    function $pb$entries(l:Lexer) :void{//Production Start
/*
pb$entries=>• pb$body_entries fn$reduce_function
pb$entries=>• sym$empty_symbol
pb$entries=>• sym$EOF_symbol
pb$entries=>• pb$body_entries
pb$body_entries=>• pb$condition_clause
pb$body_entries=>• fn$function_clause
pb$body_entries=>• pb$body_entries fn$function_clause
pb$body_entries=>• pb$body_entries pb$condition_clause
pb$body_entries=>• pb$body_entries sym$symbol
pb$body_entries=>• [ pb$body_entries ]
pb$body_entries=>• sym$symbol
pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
pb$condition_clause=>• ( τERR sym$condition_symbol_list )
pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
pb$condition_clause=>• ( τRST sym$condition_symbol_list )
pb$condition_clause=>• ( τRED sym$symbol )
fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
fn$js_function_start_symbol=>• ↦
fn$js_function_start_symbol=>• τf :
sym$symbol=>• sym$generated_symbol
sym$symbol=>• sym$production_symbol
sym$symbol=>• sym$imported_production_symbol
sym$symbol=>• sym$literal_symbol
sym$symbol=>• sym$escaped_symbol
sym$symbol=>• sym$assert_function_symbol
sym$symbol=>• ( pb$production_bodies )
sym$symbol=>• sym$symbol ?
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )
sym$symbol=>• θsym
sym$symbol=>• θtok
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
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
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
sym$empty_symbol=>• ɛ
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(const_4_.includes(l.id)||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){
 //considered syms: [,(,↦,f,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift

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
if(l.id == 48/* \↦ */||l.id == 49/* \f */){
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
setProduction(30)
add_reduce(2,30);
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
setProduction(30)
add_reduce(1,33);
return;
}
}
} else if(l.id == 23/* \ɛ */){
 //considered syms: ɛ

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$entries=>• sym$empty_symbol
*/
$sym$empty_symbol(l)
if(!FAILED){
setProduction(30)
add_reduce(1,31);
return;
}
} else if(l.id == 54/* \$eof */){
 //considered syms: $eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
pb$entries=>• sym$EOF_symbol
*/
$sym$EOF_symbol(l)
if(!FAILED){
setProduction(30)
add_reduce(1,32);
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
_with_skip(l, const__, 30/* \(--- */);
if(!FAILED){
_with_skip(l, const__, 31/* \FORK--- */);
if(!FAILED){
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(32)
add_reduce(3,37);
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
if(l.id == 33/* \EXC */){
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
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(33)
add_reduce(4,38);
return;
}
}
}
} else if(l.id == 34/* \ERR */){
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
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(33)
add_reduce(4,39);
return;
}
}
}
} else if(l.id == 35/* \IGN */){
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
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(33)
add_reduce(4,40);
return;
}
}
}
} else if(l.id == 36/* \RST */){
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
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(33)
add_reduce(4,41);
return;
}
}
}
} else if(l.id == 37/* \RED */){
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
_with_skip(l, const__, 32/* \)--- */);
if(!FAILED){
setProduction(33)
add_reduce(4,42);
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
if(l.id == 38/* \^ */){
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
setProduction(34)
add_reduce(4,43);
return;
}
}
} else if(l.id == 39/* \{ */){
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
_with_skip(l, const__, 40/* \}--- */);
if(!FAILED){
setProduction(34)
add_reduce(5,44);
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
_with_skip(l, const__, 41/* \erh--- */);
if(!FAILED){
_with_skip(l, const__, 42/* \:--- */);
if(!FAILED){
_with_skip(l, const_1_, 39/* \{--- */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40/* \}--- */);
if(!FAILED){
_with_skip(l, const_1_, 39/* \{--- */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40/* \}--- */);
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
    function $fn$reduce_function_group_07_100(l:Lexer) :void{//Production Start
/*
fn$reduce_function_group_07_100=>• τcstr
fn$reduce_function_group_07_100=>• τc
fn$reduce_function_group_07_100=>• τreturn
fn$reduce_function_group_07_100=>• τr
*/
_skip(l, const__)
if(l.id == 43/* \cstr */){
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
setProduction(36)

return;
}
} else if(l.id == 44/* \c */){
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
setProduction(36)

return;
}
} else if(l.id == 45/* \return */){
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
setProduction(36)

return;
}
} else if(l.id == 46/* \r */){
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
setProduction(36)

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
if(l.id == 47/* \=> */){
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
setProduction(37)
add_reduce(4,48);
return;
}
}
} else if(l.id == 39/* \{ */){
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
_with_skip(l, const__, 40/* \}--- */);
if(!FAILED){
setProduction(37)
add_reduce(5,46);
return;
}
}
}
} else if(l.id == 38/* \^ */){
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
setProduction(37)
add_reduce(4,47);
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
if(l.id == 38/* \^ */){
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
setProduction(38)
add_reduce(3,50);
return;
}
}
} else if(l.id == 39/* \{ */){
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
_with_skip(l, const__, 40/* \}--- */);
if(!FAILED){
setProduction(38)
add_reduce(4,49);
return;
}
}
}
}
fail(l);}
    
    function $fn$js_primitive_group_035_101(l:Lexer) :void{//Production Start
/*
fn$js_primitive_group_035_101=>• sym$generated_symbol
fn$js_primitive_group_035_101=>• sym$literal_symbol
fn$js_primitive_group_035_101=>• sym$escaped_symbol
fn$js_primitive_group_035_101=>• sym$EOF_symbol
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$EOF_symbol=>• $eof
*/
_skip(l, const__)
if(l.id == 57/* \θ */||l.id == 58/* \g */){
 //considered syms: θ,g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_035_101=>• sym$generated_symbol
*/
$sym$generated_symbol(l)
if(!FAILED){
setProduction(40)

return;
}
} else if(l.id == 59/* \τ */||l.id == 60/* \t */){
 //considered syms: τ,t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_035_101=>• sym$literal_symbol
*/
$sym$literal_symbol(l)
if(!FAILED){
setProduction(40)

return;
}
} else if(l.id == 61/* \\ */){
 //considered syms: \

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_035_101=>• sym$escaped_symbol
*/
$sym$escaped_symbol(l)
if(!FAILED){
setProduction(40)

return;
}
} else if(l.id == 54/* \$eof */){
 //considered syms: $eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive_group_035_101=>• sym$EOF_symbol
*/
$sym$EOF_symbol(l)
if(!FAILED){
setProduction(40)

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
fn$js_primitive=>• fn$js_primitive_group_035_101
fn$js_primitive_group_035_101=>• sym$generated_symbol
fn$js_primitive_group_035_101=>• sym$literal_symbol
fn$js_primitive_group_035_101=>• sym$escaped_symbol
fn$js_primitive_group_035_101=>• sym$EOF_symbol
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$EOF_symbol=>• $eof
*/
_skip(l, const_1_)
if(l.id == 54/* \$eof */||l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){
 //considered syms: θ,g,τ,t,\,$eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
fn$js_primitive=>• fn$js_primitive_group_035_101
*/
$fn$js_primitive_group_035_101(l)
if(!FAILED){
setProduction(41)
add_reduce(1,51);
return;
}
} else if(l.ty == 3/* \id--- */){
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
setProduction(41)

return;
}
} else if(l.ty == 2/* \num--- */){
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
setProduction(41)

return;
}
} else if(l.ty == 1/* \ws--- */){
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
setProduction(41)

return;
}
} else if(l.ty == 6/* \sym--- */){
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
setProduction(41)

return;
}
} else if(l.ty == 5/* \tok--- */){
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
setProduction(41)

return;
}
} else if(l.ty == 7/* \key--- */){
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
setProduction(41)

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
_with_skip(l, const_1_, 39/* \{--- */);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const_1_, 40/* \}--- */);
if(!FAILED){
setProduction(42)
add_reduce(3,52);
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
if(l.id == 48/* \↦ */){
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
setProduction(43)

return;
}
} else if(l.id == 49/* \f */){
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
_with_skip(l, const__, 42/* \:--- */);
if(!FAILED){
setProduction(43)
add_reduce(2,0);
return;
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
_with_skip(l, const_1_, 50/* \#--- */);
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
    function $cm$comment_delimiter(l:Lexer) :void{//Production Start
/*
cm$comment_delimiter=>• θnl
*/
_skip(l, const_0_)
//considered syms: nl

//Single Production Completion

//peek 0

//block 0

//groups false
/*
cm$comment_delimiter=>• θnl
*/
_with_skip(l, const__, 4/* \nl--- */);
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
_skip(l, const_1_)
if(l.ty == 6/* \sym--- */){
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
} else if(l.ty == 5/* \tok--- */){
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
} else if(l.ty == 3/* \id--- */){
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
} else if(l.ty == 2/* \num--- */){
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
} else if(l.ty == 1/* \ws--- */){
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
} else if(l.ty == 7/* \key--- */){
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
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104 sym$sym_delimter
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103
sym$grouped_symbol_group_013_103=>• θsym
sym$grouped_symbol_group_013_103=>• θid
sym$grouped_symbol_group_013_103=>• θtok
sym$grouped_symbol_group_013_103=>• θkey
*/
_skip(l, const__)
if(l.id == 57/* \θ */||l.id == 58/* \g */){
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
} else if(l.id == 59/* \τ */||l.id == 60/* \t */){
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
} else if(l.id == 61/* \\ */){
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
} else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){
 //considered syms: sym,id,tok,key

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
add_reduce(2,54);
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

if(l.ty == 4/* \nl--- */){
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
} else if(l.ty == 1/* \ws--- */){
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
    function $sym$grouped_symbol_group_013_103(l:Lexer) :void{//Production Start
/*
sym$grouped_symbol_group_013_103=>• θsym
sym$grouped_symbol_group_013_103=>• θid
sym$grouped_symbol_group_013_103=>• θtok
sym$grouped_symbol_group_013_103=>• θkey
*/
_skip(l, const__)
if(l.ty == 6/* \sym--- */){
 //considered syms: sym

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_013_103=>• θsym
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(l.ty == 3/* \id--- */){
 //considered syms: id

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_013_103=>• θid
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(l.ty == 5/* \tok--- */){
 //considered syms: tok

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_013_103=>• θtok
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
} else if(l.ty == 7/* \key--- */){
 //considered syms: key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$grouped_symbol_group_013_103=>• θkey
*/
_no_check(l);
if(!FAILED){
setProduction(57)

return;
}
}
fail(l);}
    
    function $sym$grouped_symbol(l:Lexer) :void{//Production Start
/*
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104 sym$sym_delimter
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103
sym$grouped_symbol_group_013_103=>• θsym
sym$grouped_symbol_group_013_103=>• θid
sym$grouped_symbol_group_013_103=>• θtok
sym$grouped_symbol_group_013_103=>• θkey
*/
_skip(l, const__)
//considered syms: sym,id,tok,key

//Parallel Transition
/*
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104 sym$sym_delimter
sym$grouped_symbol=>• sym$grouped_symbol_HC_listbody1_104
*/
$sym$grouped_symbol_HC_listbody1_104(l)

//Look Ahead Level 0
/*
sym$grouped_symbol=>sym$grouped_symbol_HC_listbody1_104 • sym$sym_delimter
*/

if(l.id == 54/* \$eof */||l.ty == 1/* \ws--- */||l.ty == 4/* \nl--- */){
 //considered syms: ws,nl,$eof

//Single Production Completion

//peek 0

//block 2

//groups true
/*
sym$grouped_symbol=>sym$grouped_symbol_HC_listbody1_104 • sym$sym_delimter
*/
$sym$sym_delimter(l)
if(!FAILED){
setProduction(59)
add_reduce(2,54);
return;
}
} else {
 //considered syms: END_OF_ITEM

//Single Production Completion

//peek 0

//block 2

//groups true
/*
sym$grouped_symbol=>sym$grouped_symbol_HC_listbody1_104 •
*/
if(!FAILED){
setProduction(59)
add_reduce(1,54);
return;
}
}
fail(l);}
    function $sym$ignore_symbol(l:Lexer) :void{//Production Start
/*
sym$ignore_symbol=>• sym$generated_symbol
sym$ignore_symbol=>• sym$literal_symbol
sym$ignore_symbol=>• sym$escaped_symbol
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
*/
_skip(l, const__)
if(l.id == 57/* \θ */||l.id == 58/* \g */){
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
} else if(l.id == 59/* \τ */||l.id == 60/* \t */){
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
} else if(l.id == 61/* \\ */){
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
}
fail(l);}
    function $sym$terminal_symbol(l:Lexer) :void{//Production Start
/*
sym$terminal_symbol=>• sym$generated_symbol
sym$terminal_symbol=>• sym$literal_symbol
sym$terminal_symbol=>• sym$escaped_symbol
sym$terminal_symbol=>• sym$assert_function_symbol
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
*/
_skip(l, const__)
if(l.id == 57/* \θ */||l.id == 58/* \g */){
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
} else if(l.id == 59/* \τ */||l.id == 60/* \t */){
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
} else if(l.id == 55/* \assert */||l.id == 56/* \shift */){
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
} else if(l.id == 61/* \\ */){
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
}
fail(l);}
    function $sym$symbol_group_031_105(l:Lexer) :void{//Production Start
/*
sym$symbol_group_031_105=>• (+
sym$symbol_group_031_105=>• (*
*/
_skip(l, const__)
if(l.id == 52/* \(+ */){
 //considered syms: (+

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$symbol_group_031_105=>• (+
*/
_no_check(l);
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 53/* \(* */){
 //considered syms: (*

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$symbol_group_031_105=>• (*
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
_with_skip(l, const_1_, 54/* \$eof--- */);
if(!FAILED){
setProduction(64)
add_reduce(1,58);
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
_with_skip(l, const__, 23/* \ɛ--- */);
if(!FAILED){
setProduction(65)
add_reduce(1,59);
return;
}
fail(l);}
    function $sym$assert_function_symbol(l:Lexer) :void{//Production Start
/*
sym$assert_function_symbol=>• τassert : sym$identifier
sym$assert_function_symbol=>• τshift : sym$identifier
*/
_skip(l, const__)
if(l.id == 55/* \assert */){
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
_with_skip(l, const__, 42/* \:--- */);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(66)
add_reduce(3,60);
return;
}
}
}
} else if(l.id == 56/* \shift */){
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
_with_skip(l, const__, 42/* \:--- */);
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
    function $sym$generated_symbol_group_140_106(l:Lexer) :void{//Production Start
/*
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
*/
_skip(l, const__)
if(l.id == 57/* \θ */){
 //considered syms: θ

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$generated_symbol_group_140_106=>• θ
*/
_no_check(l);
if(!FAILED){
setProduction(67)

return;
}
} else if(l.id == 58/* \g */){
 //considered syms: g

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$generated_symbol_group_140_106=>• τg :
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 42/* \:--- */);
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
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
sym$generated_symbol_group_140_106=>• θ
sym$generated_symbol_group_140_106=>• τg :
*/
_skip(l, const__)
//considered syms: θ,g

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$generated_symbol=>• sym$generated_symbol_group_140_106 sym$identifier
*/
$sym$generated_symbol_group_140_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(68)
add_reduce(2,62);
return;
}
}
fail(l);}
    function $sym$literal_symbol_group_143_107(l:Lexer) :void{//Production Start
/*
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
*/
_skip(l, const__)
if(l.id == 59/* \τ */){
 //considered syms: τ

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_143_107=>• τ
*/
_no_check(l);
if(!FAILED){
setProduction(69)

return;
}
} else if(l.id == 60/* \t */){
 //considered syms: t

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_143_107=>• τt :
*/
_no_check(l);
if(!FAILED){
_with_skip(l, const__, 42/* \:--- */);
if(!FAILED){
setProduction(69)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$literal_symbol_group_045_108(l:Lexer) :void{//Production Start
/*
sym$literal_symbol_group_045_108=>• sym$identifier
sym$literal_symbol_group_045_108=>• def$natural
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
if(l.id == 76/* \_ */||l.id == 77/* \$ */||l.ty == 3/* \id--- */||l.ty == 7/* \key--- */){
 //considered syms: _,$,id,key

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_045_108=>• sym$identifier
*/
$sym$identifier(l)
if(!FAILED){
setProduction(70)

return;
}
} else if(l.ty == 2/* \num--- */){
 //considered syms: num

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$literal_symbol_group_045_108=>• def$natural
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
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
sym$literal_symbol_group_143_107=>• τ
sym$literal_symbol_group_143_107=>• τt :
*/
_skip(l, const__)
//considered syms: τ,t

//Parallel Transition
/*
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>• sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108
*/
$sym$literal_symbol_group_143_107(l)

//Parallel Transition
/*
sym$literal_symbol=>sym$literal_symbol_group_143_107 • sym$literal_symbol_group_045_108 sym$sym_delimter
sym$literal_symbol=>sym$literal_symbol_group_143_107 • sym$literal_symbol_group_045_108
*/
$sym$literal_symbol_group_045_108(l)

//Look Ahead Level 0
/*
sym$literal_symbol=>sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 • sym$sym_delimter
*/

if(l.id == 54/* \$eof */||l.ty == 1/* \ws--- */||l.ty == 4/* \nl--- */){
 //considered syms: ws,nl,$eof

//Single Production Completion

//peek 0

//block 2

//groups true
/*
sym$literal_symbol=>sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 • sym$sym_delimter
*/
$sym$sym_delimter(l)
if(!FAILED){
setProduction(71)
add_reduce(3,63);
return;
}
} else {
 //considered syms: END_OF_ITEM

//Single Production Completion

//peek 0

//block 2

//groups true
/*
sym$literal_symbol=>sym$literal_symbol_group_143_107 sym$literal_symbol_group_045_108 •
*/
if(!FAILED){
setProduction(71)
add_reduce(2,63);
return;
}
}
fail(l);}
    
    function $sym$escaped_symbol(l:Lexer) :void{//Production Start
/*
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
*/
_skip(l, const__)
//considered syms: \

//Single Production Completion

//peek 0

//block 0

//groups false
/*
sym$escaped_symbol=>• \ sym$escaped_symbol_HC_listbody1_109 sym$sym_delimter
*/
_with_skip(l, const__, 61/* \\--- */);
if(!FAILED){
$sym$escaped_symbol_HC_listbody1_109(l)
if(!FAILED){
$sym$sym_delimter(l)
if(!FAILED){
setProduction(73)
add_reduce(3,64);
return;
}
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
add_reduce(1,65);
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
_with_skip(l, const__, 62/* \::--- */);
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
    function $sym$sym_delimter(l:Lexer) :void{//Production Start
/*
sym$sym_delimter=>• θws
sym$sym_delimter=>• θnl
sym$sym_delimter=>• $eof
*/

if(l.id == 54/* \$eof */){
 //considered syms: $eof

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$sym_delimter=>• $eof
*/
_no_check(l);
if(!FAILED){
setProduction(79)

return;
}
} else if(l.ty == 1/* \ws--- */){
 //considered syms: ws

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$sym_delimter=>• θws
*/
_no_check(l);
if(!FAILED){
setProduction(79)

return;
}
} else if(l.ty == 4/* \nl--- */){
 //considered syms: nl

//Single Production Completion

//peek 0

//block 1

//groups true
/*
sym$sym_delimter=>• θnl
*/
_no_check(l);
if(!FAILED){
setProduction(79)

return;
}
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
_(l, 2/* \num--- */);
if(!FAILED){
setProduction(91)

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
_with_skip(l, const__, 3/* \id--- */);
if(!FAILED){
setProduction(92)

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
setProduction(100)

return;
}
fail(l);}
    
    function $pre$import_preamble_HC_listbody2_102 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|ws: 12;
pre$import_preamble_HC_listbody2_102=>• θws|ws;
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|id: 12;
pre$import_preamble_HC_listbody2_102=>• θws|id;
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|key: 12;
pre$import_preamble_HC_listbody2_102=>• θws|key;
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|sym: 12;
pre$import_preamble_HC_listbody2_102=>• θws|sym;
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|tok: 12;
pre$import_preamble_HC_listbody2_102=>• θws|tok;
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|END_OF_FILE: 12;
pre$import_preamble_HC_listbody2_102=>• θws|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 1/* \ws--- */){ 
             
            _no_check(l);;stack_ptr++;State16(l);
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 12: //pre$import_preamble_HC_listbody2_102
if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ return;}
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
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State15 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|ws;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|id;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|key;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|sym;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|tok;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 • θws|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 1/* \ws--- */){ 
             
            _no_check(l);;stack_ptr++;State179(l);
             
            }
else fail(l);
}
    function State16 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>θws •|ws;
pre$import_preamble_HC_listbody2_102=>θws •|id;
pre$import_preamble_HC_listbody2_102=>θws •|key;
pre$import_preamble_HC_listbody2_102=>θws •|sym;
pre$import_preamble_HC_listbody2_102=>θws •|tok;
pre$import_preamble_HC_listbody2_102=>θws •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(5,1,12); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody1_104 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|id: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|id: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|key: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|key: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|sym: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|sym: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|tok: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|tok: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|ws: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|ws: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|END_OF_FILE: 14;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|END_OF_FILE: 14
*/
_skip(l, const_1_)
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 14: //pre$import_preamble_HC_listbody1_104
if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State18(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 13: //pre$import_preamble_group_019_103
State19(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State18 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|id: 14;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|key: 14;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|sym: 14;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|tok: 14;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|ws: 14;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|END_OF_FILE: 14
*/
_skip(l, const_1_)
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 13: //pre$import_preamble_group_019_103
State181(l)
 break;
case 14/*pre$import_preamble_HC_listbody1_104*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State19 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|id;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|key;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|sym;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|tok;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|ws;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(13,1,14); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody4_105 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|ws: 15;
pre$import_preamble_HC_listbody4_105=>• θws|ws;
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|AS: 15;
pre$import_preamble_HC_listbody4_105=>• θws|AS;
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|as: 15;
pre$import_preamble_HC_listbody4_105=>• θws|as;
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|END_OF_FILE: 15;
pre$import_preamble_HC_listbody4_105=>• θws|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 1/* \ws--- */){ 
             
            _no_check(l);;stack_ptr++;State26(l);
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 15: //pre$import_preamble_HC_listbody4_105
if(l.id == 19/* \AS */||l.id == 20/* \as */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State25(cp)
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
    function State25 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 • θws|ws;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 • θws|AS;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 • θws|as;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 • θws|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 1/* \ws--- */){ 
             
            _no_check(l);;stack_ptr++;State182(l);
             
            }
else fail(l);
}
    function State26 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>θws •|ws;
pre$import_preamble_HC_listbody4_105=>θws •|AS;
pre$import_preamble_HC_listbody4_105=>θws •|as;
pre$import_preamble_HC_listbody4_105=>θws •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.id == 19/* \AS */||l.id == 20/* \as */){ 
             
            completeProduction(5,1,15); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */){ 
             
            completeProduction(5,1,15); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$preamble (l: Lexer): void{
                /*
pre$preamble=>• pre$preamble pre$preamble_clause|<>: 3;
pre$preamble=>• pre$preamble_clause|<>: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|+>: 3;
pre$preamble=>• pre$preamble_clause|+>: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|↦: 3;
pre$preamble=>• pre$preamble_clause|↦: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|f: 3;
pre$preamble=>• pre$preamble_clause|f: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|ɛ: 3;
pre$preamble=>• pre$preamble_clause|ɛ: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|@: 3;
pre$preamble=>• pre$preamble_clause|@: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|#: 3;
pre$preamble=>• pre$preamble_clause|#: 3;
pre$preamble=>• pre$preamble pre$preamble_clause|END_OF_FILE: 3;
pre$preamble=>• pre$preamble_clause|END_OF_FILE: 3
*/
_skip(l, const__)
if(l.id == 10/* \@ */||l.id == 50/* \# */){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 4: //pre$preamble_clause
State29(l)
 break;
case 3: //pre$preamble
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 23/* \ɛ */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State28(cp)
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
    function State28 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble • pre$preamble_clause|<>: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|+>: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|↦: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|f: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|ɛ: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|@: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|#: 3;
pre$preamble=>pre$preamble • pre$preamble_clause|END_OF_FILE: 3
*/
_skip(l, const__)
if(l.id == 10/* \@ */||l.id == 50/* \# */){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 4: //pre$preamble_clause
State183(l)
 break;
case 3/*pre$preamble*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State29 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble_clause •|<>;
pre$preamble=>pre$preamble_clause •|+>;
pre$preamble=>pre$preamble_clause •|↦;
pre$preamble=>pre$preamble_clause •|f;
pre$preamble=>pre$preamble_clause •|ɛ;
pre$preamble=>pre$preamble_clause •|@;
pre$preamble=>pre$preamble_clause •|#;
pre$preamble=>pre$preamble_clause •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 10/* \@ */||l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 23/* \ɛ */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(5,1,3); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(5,1,3); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $prd$productions (l: Lexer): void{
                /*
prd$productions=>• prd$production|<>: 19;
prd$productions=>• fn$referenced_function|<>: 19;
prd$productions=>• prd$productions prd$production|<>: 19;
prd$productions=>• prd$productions cm$comment|<>: 19;
prd$productions=>• prd$productions fn$referenced_function|<>: 19;
prd$productions=>• ɛ|<>;
prd$productions=>• prd$production|+>: 19;
prd$productions=>• fn$referenced_function|+>: 19;
prd$productions=>• prd$productions prd$production|+>: 19;
prd$productions=>• prd$productions cm$comment|+>: 19;
prd$productions=>• prd$productions fn$referenced_function|+>: 19;
prd$productions=>• ɛ|+>;
prd$productions=>• prd$production|#: 19;
prd$productions=>• fn$referenced_function|#: 19;
prd$productions=>• prd$productions prd$production|#: 19;
prd$productions=>• prd$productions cm$comment|#: 19;
prd$productions=>• prd$productions fn$referenced_function|#: 19;
prd$productions=>• ɛ|#;
prd$productions=>• prd$production|↦: 19;
prd$productions=>• fn$referenced_function|↦: 19;
prd$productions=>• prd$productions prd$production|↦: 19;
prd$productions=>• prd$productions cm$comment|↦: 19;
prd$productions=>• prd$productions fn$referenced_function|↦: 19;
prd$productions=>• ɛ|↦;
prd$productions=>• prd$production|f: 19;
prd$productions=>• fn$referenced_function|f: 19;
prd$productions=>• prd$productions prd$production|f: 19;
prd$productions=>• prd$productions cm$comment|f: 19;
prd$productions=>• prd$productions fn$referenced_function|f: 19;
prd$productions=>• ɛ|f;
prd$productions=>• prd$production|END_OF_FILE: 19;
prd$productions=>• fn$referenced_function|END_OF_FILE: 19;
prd$productions=>• prd$productions prd$production|END_OF_FILE: 19;
prd$productions=>• prd$productions cm$comment|END_OF_FILE: 19;
prd$productions=>• prd$productions fn$referenced_function|END_OF_FILE: 19;
prd$productions=>• ɛ|END_OF_FILE
*/
_skip(l, const__)
if(idm30.has(l.id)){idm30.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 34: //fn$referenced_function
State32(l)
 break;
case 24: //prd$production
State31(l)
 break;
case 19: //prd$productions
if(l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State33(cp)
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
    function State31 (l: Lexer): void{
                /*
prd$productions=>prd$production •|<>;
prd$productions=>prd$production •|+>;
prd$productions=>prd$production •|#;
prd$productions=>prd$production •|↦;
prd$productions=>prd$production •|f;
prd$productions=>prd$production •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(15,1,19); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(15,1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State32 (l: Lexer): void{
                /*
prd$productions=>fn$referenced_function •|<>;
prd$productions=>fn$referenced_function •|+>;
prd$productions=>fn$referenced_function •|#;
prd$productions=>fn$referenced_function •|↦;
prd$productions=>fn$referenced_function •|f;
prd$productions=>fn$referenced_function •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(16,1,19); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(16,1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State33 (l: Lexer): void{
                /*
prd$productions=>prd$productions • prd$production|<>: 19;
prd$productions=>prd$productions • cm$comment|<>: 19;
prd$productions=>prd$productions • fn$referenced_function|<>: 19;
prd$productions=>prd$productions • prd$production|+>: 19;
prd$productions=>prd$productions • cm$comment|+>: 19;
prd$productions=>prd$productions • fn$referenced_function|+>: 19;
prd$productions=>prd$productions • prd$production|#: 19;
prd$productions=>prd$productions • cm$comment|#: 19;
prd$productions=>prd$productions • fn$referenced_function|#: 19;
prd$productions=>prd$productions • prd$production|↦: 19;
prd$productions=>prd$productions • cm$comment|↦: 19;
prd$productions=>prd$productions • fn$referenced_function|↦: 19;
prd$productions=>prd$productions • prd$production|f: 19;
prd$productions=>prd$productions • cm$comment|f: 19;
prd$productions=>prd$productions • fn$referenced_function|f: 19;
prd$productions=>prd$productions • prd$production|END_OF_FILE: 19;
prd$productions=>prd$productions • cm$comment|END_OF_FILE: 19;
prd$productions=>prd$productions • fn$referenced_function|END_OF_FILE: 19
*/
_skip(l, const__)
if(idm33.has(l.id)){idm33.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State191(l)
 break;
case 34: //fn$referenced_function
State192(l)
 break;
case 24: //prd$production
State190(l)
 break;
case 19/*prd$productions*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State34 (l: Lexer): void{
                /*
prd$productions=>ɛ •|<>;
prd$productions=>ɛ •|+>;
prd$productions=>ɛ •|#;
prd$productions=>ɛ •|↦;
prd$productions=>ɛ •|f;
prd$productions=>ɛ •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProductionPlain(1,19); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProductionPlain(1,19); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State35 (l: Lexer): void{
                /*
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|+>: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|#: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|↦: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|f: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|END_OF_FILE: 24;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(l.id == 76/* \_ */||l.id == 77/* \$ */){ 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_08_100(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $prd$production_group_013_103(l); stack_ptr++;;
        }else l.sync(cp);
         
            } else if(l.ty == 3/* \id--- */||l.ty == 7/* \key--- */){ 
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
case 23: //prd$production_group_013_103
State196(l)
 break;
case 20: //prd$production_group_08_100
State195(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State36 (l: Lexer): void{
                /*
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(l.id == 76/* \_ */||l.id == 77/* \$ */){ 
             
            $prd$production_group_013_103(l); stack_ptr++;
             
            } else if(l.ty == 3/* \id--- */||l.ty == 7/* \key--- */){ 
             
            $prd$production_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 23: //prd$production_group_013_103
State204(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pre$symbols_preamble_HC_listbody2_101 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|θ: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|θ: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|g: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|g: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|τ: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|τ: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|t: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|t: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|\: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|\: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|sym: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|sym: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|id: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|id: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|tok: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|tok: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|key: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|key: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|nl: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|nl: 5;
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|END_OF_FILE: 5;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|END_OF_FILE: 5
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55: //sym$lexer_symbol
State42(l)
 break;
case 5: //pre$symbols_preamble_HC_listbody2_101
if(l.ty == 0 /*--*//* EOF */||l.ty == 4/* \nl--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State41(cp)
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
    function State41 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|θ: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|g: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|τ: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|t: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|\: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|sym: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|id: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|tok: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|key: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|nl: 5;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|END_OF_FILE: 5
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 55: //sym$lexer_symbol
State194(l)
 break;
case 5/*pre$symbols_preamble_HC_listbody2_101*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State42 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|θ;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|g;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|τ;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|t;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|\;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|sym;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|id;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|tok;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|key;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|nl;
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|END_OF_FILE
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            completeProduction(5,1,5); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(5,1,5); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State55 (l: Lexer): void{
                /*
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|ws;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|nl;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|$eof;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|sym;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|id;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|tok;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|key;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_group_013_103 •|END_OF_FILE
*/
if(l.id == 54/* \$eof */){ 
             
            completeProduction(13,1,58); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(13,1,58); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $cm$comment_data (l: Lexer): void{
                /*
cm$comment_data=>• cm$comment_primitive|nl: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|nl: 47;
cm$comment_data=>• cm$comment_primitive|sym: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|sym: 47;
cm$comment_data=>• cm$comment_primitive|tok: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|tok: 47;
cm$comment_data=>• cm$comment_primitive|id: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|id: 47;
cm$comment_data=>• cm$comment_primitive|num: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|num: 47;
cm$comment_data=>• cm$comment_primitive|ws: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|ws: 47;
cm$comment_data=>• cm$comment_primitive|key: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|key: 47;
cm$comment_data=>• cm$comment_primitive|END_OF_FILE: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|END_OF_FILE: 47
*/
if(l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48: //cm$comment_primitive
State61(l)
 break;
case 47: //cm$comment_data
if(l.ty == 0 /*--*//* EOF */||l.ty == 4/* \nl--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State62(cp)
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
    function State61 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_primitive •|nl;
cm$comment_data=>cm$comment_primitive •|sym;
cm$comment_data=>cm$comment_primitive •|tok;
cm$comment_data=>cm$comment_primitive •|id;
cm$comment_data=>cm$comment_primitive •|num;
cm$comment_data=>cm$comment_primitive •|ws;
cm$comment_data=>cm$comment_primitive •|key;
cm$comment_data=>cm$comment_primitive •|END_OF_FILE
*/
if(tym61r.has(l.ty)){tym61r.get(l.ty)(l); return;}
else fail(l);
}
    function State62 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_data • cm$comment_primitive|nl: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|sym: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|tok: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|id: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|num: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|ws: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|key: 47;
cm$comment_data=>cm$comment_data • cm$comment_primitive|END_OF_FILE: 47
*/
if(l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 48: //cm$comment_primitive
State219(l)
 break;
case 47/*cm$comment_data*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$condition_symbol_list (l: Lexer): void{
                /*
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|): 50;
sym$condition_symbol_list=>• sym$terminal_symbol|): 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|θ: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|θ: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|g: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|g: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|τ: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|τ: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|t: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|t: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|\: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|\: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|assert: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|assert: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|shift: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|shift: 50;
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|END_OF_FILE: 50;
sym$condition_symbol_list=>• sym$terminal_symbol|END_OF_FILE: 50
*/
_skip(l, const__)
if(l.id == 55/* \assert */||l.id == 56/* \shift */||l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State86(l)
 break;
case 50: //sym$condition_symbol_list
if(l.id == 32/* \) */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State85(cp)
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
    function State85 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|): 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|θ: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|g: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|τ: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|t: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|\: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|assert: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|shift: 50;
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|END_OF_FILE: 50
*/
_skip(l, const__)
if(l.id == 55/* \assert */||l.id == 56/* \shift */||l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State227(l)
 break;
case 50/*sym$condition_symbol_list*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State86 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$terminal_symbol •|);
sym$condition_symbol_list=>sym$terminal_symbol •|θ;
sym$condition_symbol_list=>sym$terminal_symbol •|g;
sym$condition_symbol_list=>sym$terminal_symbol •|τ;
sym$condition_symbol_list=>sym$terminal_symbol •|t;
sym$condition_symbol_list=>sym$terminal_symbol •|\;
sym$condition_symbol_list=>sym$terminal_symbol •|assert;
sym$condition_symbol_list=>sym$terminal_symbol •|shift;
sym$condition_symbol_list=>sym$terminal_symbol •|END_OF_FILE
*/
_skip(l, const__)
if(idm86r.has(l.id)){idm86r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(5,1,50); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $sym$grouped_symbol_HC_listbody1_104 (l: Lexer): void{
                /*
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|sym: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|sym: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|id: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|id: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|tok: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|tok: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|key: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|key: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|ws: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|ws: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|nl: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|nl: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|$eof: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|$eof: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103|END_OF_FILE: 58;
sym$grouped_symbol_HC_listbody1_104=>• sym$grouped_symbol_group_013_103|END_OF_FILE: 58
*/
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 58: //sym$grouped_symbol_HC_listbody1_104
if(l.id == 54/* \$eof */||l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 4/* \nl--- */){ return;}
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
case 57: //sym$grouped_symbol_group_013_103
State55(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State91 (l: Lexer): void{
                /*
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|sym: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|id: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|tok: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|key: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|ws: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|nl: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|$eof: 58;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 • sym$grouped_symbol_group_013_103|END_OF_FILE: 58
*/
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 57: //sym$grouped_symbol_group_013_103
State213(l)
 break;
case 58/*sym$grouped_symbol_HC_listbody1_104*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$ignore_symbols (l: Lexer): void{
                /*
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|nl: 54;
sym$ignore_symbols=>• sym$ignore_symbol|nl: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|θ: 54;
sym$ignore_symbols=>• sym$ignore_symbol|θ: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|g: 54;
sym$ignore_symbols=>• sym$ignore_symbol|g: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|τ: 54;
sym$ignore_symbols=>• sym$ignore_symbol|τ: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|t: 54;
sym$ignore_symbols=>• sym$ignore_symbol|t: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|\: 54;
sym$ignore_symbols=>• sym$ignore_symbol|\: 54;
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|END_OF_FILE: 54;
sym$ignore_symbols=>• sym$ignore_symbol|END_OF_FILE: 54
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60: //sym$ignore_symbol
State94(l)
 break;
case 54: //sym$ignore_symbols
if(l.ty == 0 /*--*//* EOF */||l.ty == 4/* \nl--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State93(cp)
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
    function State93 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|nl: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|θ: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|g: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|τ: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|t: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|\: 54;
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|END_OF_FILE: 54
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 60: //sym$ignore_symbol
State229(l)
 break;
case 54/*sym$ignore_symbols*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State94 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbol •|nl;
sym$ignore_symbols=>sym$ignore_symbol •|θ;
sym$ignore_symbols=>sym$ignore_symbol •|g;
sym$ignore_symbols=>sym$ignore_symbol •|τ;
sym$ignore_symbols=>sym$ignore_symbol •|t;
sym$ignore_symbols=>sym$ignore_symbol •|\;
sym$ignore_symbols=>sym$ignore_symbol •|END_OF_FILE
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            completeProduction(5,1,54); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 4/* \nl--- */){ 
             
            completeProduction(5,1,54); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $sym$escaped_symbol_HC_listbody1_109 (l: Lexer): void{
                /*
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|sym: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|sym: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|id: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|id: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|tok: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|tok: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|key: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|key: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|ws: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|ws: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|nl: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|nl: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|$eof: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|$eof: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103|END_OF_FILE: 72;
sym$escaped_symbol_HC_listbody1_109=>• sym$grouped_symbol_group_013_103|END_OF_FILE: 72
*/
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 72: //sym$escaped_symbol_HC_listbody1_109
if(l.id == 54/* \$eof */||l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 4/* \nl--- */){ return;}
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
case 57: //sym$grouped_symbol_group_013_103
State97(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State96 (l: Lexer): void{
                /*
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|sym: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|id: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|tok: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|key: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|ws: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|nl: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|$eof: 72;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 • sym$grouped_symbol_group_013_103|END_OF_FILE: 72
*/
if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 57: //sym$grouped_symbol_group_013_103
State254(l)
 break;
case 72/*sym$escaped_symbol_HC_listbody1_109*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State97 (l: Lexer): void{
                /*
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|sym;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|id;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|tok;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|key;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|ws;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|nl;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|$eof;
sym$escaped_symbol_HC_listbody1_109=>sym$grouped_symbol_group_013_103 •|END_OF_FILE
*/
if(l.id == 54/* \$eof */){ 
             
            completeProduction(13,1,72); stack_ptr-=1;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(13,1,72); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $fn$js_data (l: Lexer): void{
                /*
fn$js_data=>• fn$js_primitive|}: 39;
fn$js_data=>• fn$js_data_block|}: 39;
fn$js_data=>• fn$js_data fn$js_primitive|}: 39;
fn$js_data=>• fn$js_data fn$js_data_block|}: 39;
fn$js_data=>• ɛ|};
fn$js_data=>• fn$js_primitive|id: 39;
fn$js_data=>• fn$js_data_block|id: 39;
fn$js_data=>• fn$js_data fn$js_primitive|id: 39;
fn$js_data=>• fn$js_data fn$js_data_block|id: 39;
fn$js_data=>• ɛ|id;
fn$js_data=>• fn$js_primitive|num: 39;
fn$js_data=>• fn$js_data_block|num: 39;
fn$js_data=>• fn$js_data fn$js_primitive|num: 39;
fn$js_data=>• fn$js_data fn$js_data_block|num: 39;
fn$js_data=>• ɛ|num;
fn$js_data=>• fn$js_primitive|ws: 39;
fn$js_data=>• fn$js_data_block|ws: 39;
fn$js_data=>• fn$js_data fn$js_primitive|ws: 39;
fn$js_data=>• fn$js_data fn$js_data_block|ws: 39;
fn$js_data=>• ɛ|ws;
fn$js_data=>• fn$js_primitive|sym: 39;
fn$js_data=>• fn$js_data_block|sym: 39;
fn$js_data=>• fn$js_data fn$js_primitive|sym: 39;
fn$js_data=>• fn$js_data fn$js_data_block|sym: 39;
fn$js_data=>• ɛ|sym;
fn$js_data=>• fn$js_primitive|tok: 39;
fn$js_data=>• fn$js_data_block|tok: 39;
fn$js_data=>• fn$js_data fn$js_primitive|tok: 39;
fn$js_data=>• fn$js_data fn$js_data_block|tok: 39;
fn$js_data=>• ɛ|tok;
fn$js_data=>• fn$js_primitive|key: 39;
fn$js_data=>• fn$js_data_block|key: 39;
fn$js_data=>• fn$js_data fn$js_primitive|key: 39;
fn$js_data=>• fn$js_data fn$js_data_block|key: 39;
fn$js_data=>• ɛ|key;
fn$js_data=>• fn$js_primitive|θ: 39;
fn$js_data=>• fn$js_data_block|θ: 39;
fn$js_data=>• fn$js_data fn$js_primitive|θ: 39;
fn$js_data=>• fn$js_data fn$js_data_block|θ: 39;
fn$js_data=>• ɛ|θ;
fn$js_data=>• fn$js_primitive|g: 39;
fn$js_data=>• fn$js_data_block|g: 39;
fn$js_data=>• fn$js_data fn$js_primitive|g: 39;
fn$js_data=>• fn$js_data fn$js_data_block|g: 39;
fn$js_data=>• ɛ|g;
fn$js_data=>• fn$js_primitive|τ: 39;
fn$js_data=>• fn$js_data_block|τ: 39;
fn$js_data=>• fn$js_data fn$js_primitive|τ: 39;
fn$js_data=>• fn$js_data fn$js_data_block|τ: 39;
fn$js_data=>• ɛ|τ;
fn$js_data=>• fn$js_primitive|t: 39;
fn$js_data=>• fn$js_data_block|t: 39;
fn$js_data=>• fn$js_data fn$js_primitive|t: 39;
fn$js_data=>• fn$js_data fn$js_data_block|t: 39;
fn$js_data=>• ɛ|t;
fn$js_data=>• fn$js_primitive|\: 39;
fn$js_data=>• fn$js_data_block|\: 39;
fn$js_data=>• fn$js_data fn$js_primitive|\: 39;
fn$js_data=>• fn$js_data fn$js_data_block|\: 39;
fn$js_data=>• ɛ|\;
fn$js_data=>• fn$js_primitive|$eof: 39;
fn$js_data=>• fn$js_data_block|$eof: 39;
fn$js_data=>• fn$js_data fn$js_primitive|$eof: 39;
fn$js_data=>• fn$js_data fn$js_data_block|$eof: 39;
fn$js_data=>• ɛ|$eof;
fn$js_data=>• fn$js_primitive|{: 39;
fn$js_data=>• fn$js_data_block|{: 39;
fn$js_data=>• fn$js_data fn$js_primitive|{: 39;
fn$js_data=>• fn$js_data fn$js_data_block|{: 39;
fn$js_data=>• ɛ|{;
fn$js_data=>• fn$js_primitive|END_OF_FILE: 39;
fn$js_data=>• fn$js_data_block|END_OF_FILE: 39;
fn$js_data=>• fn$js_data fn$js_primitive|END_OF_FILE: 39;
fn$js_data=>• fn$js_data fn$js_data_block|END_OF_FILE: 39;
fn$js_data=>• ɛ|END_OF_FILE
*/
_skip(l, const_1_)
if(idm101.has(l.id)){idm101.get(l.id)(l); } else if(l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 42: //fn$js_data_block
State103(l)
 break;
case 41: //fn$js_primitive
State102(l)
 break;
case 39: //fn$js_data
if(l.id == 40/* \} */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State104(cp)
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
    function State102 (l: Lexer): void{
                /*
fn$js_data=>fn$js_primitive •|};
fn$js_data=>fn$js_primitive •|id;
fn$js_data=>fn$js_primitive •|num;
fn$js_data=>fn$js_primitive •|ws;
fn$js_data=>fn$js_primitive •|sym;
fn$js_data=>fn$js_primitive •|tok;
fn$js_data=>fn$js_primitive •|key;
fn$js_data=>fn$js_primitive •|θ;
fn$js_data=>fn$js_primitive •|g;
fn$js_data=>fn$js_primitive •|τ;
fn$js_data=>fn$js_primitive •|t;
fn$js_data=>fn$js_primitive •|\;
fn$js_data=>fn$js_primitive •|$eof;
fn$js_data=>fn$js_primitive •|{;
fn$js_data=>fn$js_primitive •|END_OF_FILE
*/
_skip(l, const_1_)
if(idm105r.has(l.id)){idm105r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,39); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State103 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data_block •|};
fn$js_data=>fn$js_data_block •|id;
fn$js_data=>fn$js_data_block •|num;
fn$js_data=>fn$js_data_block •|ws;
fn$js_data=>fn$js_data_block •|sym;
fn$js_data=>fn$js_data_block •|tok;
fn$js_data=>fn$js_data_block •|key;
fn$js_data=>fn$js_data_block •|θ;
fn$js_data=>fn$js_data_block •|g;
fn$js_data=>fn$js_data_block •|τ;
fn$js_data=>fn$js_data_block •|t;
fn$js_data=>fn$js_data_block •|\;
fn$js_data=>fn$js_data_block •|$eof;
fn$js_data=>fn$js_data_block •|{;
fn$js_data=>fn$js_data_block •|END_OF_FILE
*/
_skip(l, const_1_)
if(idm105r.has(l.id)){idm105r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,39); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State104 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data • fn$js_primitive|}: 39;
fn$js_data=>fn$js_data • fn$js_data_block|}: 39;
fn$js_data=>fn$js_data • fn$js_primitive|id: 39;
fn$js_data=>fn$js_data • fn$js_data_block|id: 39;
fn$js_data=>fn$js_data • fn$js_primitive|num: 39;
fn$js_data=>fn$js_data • fn$js_data_block|num: 39;
fn$js_data=>fn$js_data • fn$js_primitive|ws: 39;
fn$js_data=>fn$js_data • fn$js_data_block|ws: 39;
fn$js_data=>fn$js_data • fn$js_primitive|sym: 39;
fn$js_data=>fn$js_data • fn$js_data_block|sym: 39;
fn$js_data=>fn$js_data • fn$js_primitive|tok: 39;
fn$js_data=>fn$js_data • fn$js_data_block|tok: 39;
fn$js_data=>fn$js_data • fn$js_primitive|key: 39;
fn$js_data=>fn$js_data • fn$js_data_block|key: 39;
fn$js_data=>fn$js_data • fn$js_primitive|θ: 39;
fn$js_data=>fn$js_data • fn$js_data_block|θ: 39;
fn$js_data=>fn$js_data • fn$js_primitive|g: 39;
fn$js_data=>fn$js_data • fn$js_data_block|g: 39;
fn$js_data=>fn$js_data • fn$js_primitive|τ: 39;
fn$js_data=>fn$js_data • fn$js_data_block|τ: 39;
fn$js_data=>fn$js_data • fn$js_primitive|t: 39;
fn$js_data=>fn$js_data • fn$js_data_block|t: 39;
fn$js_data=>fn$js_data • fn$js_primitive|\: 39;
fn$js_data=>fn$js_data • fn$js_data_block|\: 39;
fn$js_data=>fn$js_data • fn$js_primitive|$eof: 39;
fn$js_data=>fn$js_data • fn$js_data_block|$eof: 39;
fn$js_data=>fn$js_data • fn$js_primitive|{: 39;
fn$js_data=>fn$js_data • fn$js_data_block|{: 39;
fn$js_data=>fn$js_data • fn$js_primitive|END_OF_FILE: 39;
fn$js_data=>fn$js_data • fn$js_data_block|END_OF_FILE: 39
*/
_skip(l, const_1_)
if(idm104.has(l.id)){idm104.get(l.id)(l); } else if(l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $fn$js_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 42: //fn$js_data_block
State257(l)
 break;
case 41: //fn$js_primitive
State256(l)
 break;
case 39/*fn$js_data*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State105 (l: Lexer): void{
                /*
fn$js_data=>ɛ •|};
fn$js_data=>ɛ •|id;
fn$js_data=>ɛ •|num;
fn$js_data=>ɛ •|ws;
fn$js_data=>ɛ •|sym;
fn$js_data=>ɛ •|tok;
fn$js_data=>ɛ •|key;
fn$js_data=>ɛ •|θ;
fn$js_data=>ɛ •|g;
fn$js_data=>ɛ •|τ;
fn$js_data=>ɛ •|t;
fn$js_data=>ɛ •|\;
fn$js_data=>ɛ •|$eof;
fn$js_data=>ɛ •|{;
fn$js_data=>ɛ •|END_OF_FILE
*/
_skip(l, const_1_)
if(idm105r.has(l.id)){idm105r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,39); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State167 (l: Lexer): void{
                /*
def$js_id_symbols=>θkey •|id;
def$js_id_symbols=>θkey •|key;
def$js_id_symbols=>θkey •|_;
def$js_id_symbols=>θkey •|$;
def$js_id_symbols=>θkey •|num;
def$js_id_symbols=>θkey •|hex;
def$js_id_symbols=>θkey •|bin;
def$js_id_symbols=>θkey •|oct;
def$js_id_symbols=>θkey •|sci;
def$js_id_symbols=>θkey •|flt;
def$js_id_symbols=>θkey •|END_OF_FILE;
def$js_id_symbols=>θkey •|→;
def$js_id_symbols=>θkey •|>;
def$js_id_symbols=>θkey •|::;
def$js_id_symbols=>θkey •|^;
def$js_id_symbols=>θkey •|{;
def$js_id_symbols=>θkey •|θ;
def$js_id_symbols=>θkey •|g;
def$js_id_symbols=>θkey •|τ;
def$js_id_symbols=>θkey •|t;
def$js_id_symbols=>θkey •|\;
def$js_id_symbols=>θkey •|sym;
def$js_id_symbols=>θkey •|tok;
def$js_id_symbols=>θkey •|nl;
def$js_id_symbols=>θkey •|ws;
def$js_id_symbols=>θkey •|$eof;
def$js_id_symbols=>θkey •|assert;
def$js_id_symbols=>θkey •|shift;
def$js_id_symbols=>θkey •|);
def$js_id_symbols=>θkey •|?;
def$js_id_symbols=>θkey •|(+;
def$js_id_symbols=>θkey •|(*;
def$js_id_symbols=>θkey •|(;
def$js_id_symbols=>θkey •|↦;
def$js_id_symbols=>θkey •|f;
def$js_id_symbols=>θkey •|│;
def$js_id_symbols=>θkey •||;
def$js_id_symbols=>θkey •|#;
def$js_id_symbols=>θkey •|<>;
def$js_id_symbols=>θkey •|+>;
def$js_id_symbols=>θkey •|};
def$js_id_symbols=>θkey •|]
*/
if(idm200r.has(l.id)){idm200r.get(l.id)(l); return;} else if(tym200r.has(l.ty)){tym200r.get(l.ty)(l); return;}
else fail(l);
}
    function State179 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|ws;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|id;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|key;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|sym;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|tok;
pre$import_preamble_HC_listbody2_102=>pre$import_preamble_HC_listbody2_102 θws •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(4,2,12); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State181 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|id;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|key;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|sym;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|tok;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|ws;
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(12,2,14); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State182 (l: Lexer): void{
                /*
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 θws •|ws;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 θws •|AS;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 θws •|as;
pre$import_preamble_HC_listbody4_105=>pre$import_preamble_HC_listbody4_105 θws •|END_OF_FILE
*/
_skip(l, const_1_)
if(l.id == 19/* \AS */||l.id == 20/* \as */){ 
             
            completeProduction(4,2,15); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */){ 
             
            completeProduction(4,2,15); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State183 (l: Lexer): void{
                /*
pre$preamble=>pre$preamble pre$preamble_clause •|<>;
pre$preamble=>pre$preamble pre$preamble_clause •|+>;
pre$preamble=>pre$preamble pre$preamble_clause •|↦;
pre$preamble=>pre$preamble pre$preamble_clause •|f;
pre$preamble=>pre$preamble pre$preamble_clause •|ɛ;
pre$preamble=>pre$preamble pre$preamble_clause •|@;
pre$preamble=>pre$preamble pre$preamble_clause •|#;
pre$preamble=>pre$preamble pre$preamble_clause •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 10/* \@ */||l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 23/* \ɛ */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(4,2,3); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(4,2,3); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State190 (l: Lexer): void{
                /*
prd$productions=>prd$productions prd$production •|<>;
prd$productions=>prd$productions prd$production •|+>;
prd$productions=>prd$productions prd$production •|#;
prd$productions=>prd$productions prd$production •|↦;
prd$productions=>prd$productions prd$production •|f;
prd$productions=>prd$productions prd$production •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(17,2,19); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(17,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State191 (l: Lexer): void{
                /*
prd$productions=>prd$productions cm$comment •|<>;
prd$productions=>prd$productions cm$comment •|+>;
prd$productions=>prd$productions cm$comment •|#;
prd$productions=>prd$productions cm$comment •|↦;
prd$productions=>prd$productions cm$comment •|f;
prd$productions=>prd$productions cm$comment •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(1,2,19); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(1,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State192 (l: Lexer): void{
                /*
prd$productions=>prd$productions fn$referenced_function •|<>;
prd$productions=>prd$productions fn$referenced_function •|+>;
prd$productions=>prd$productions fn$referenced_function •|#;
prd$productions=>prd$productions fn$referenced_function •|↦;
prd$productions=>prd$productions fn$referenced_function •|f;
prd$productions=>prd$productions fn$referenced_function •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(18,2,19); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(18,2,19); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State194 (l: Lexer): void{
                /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|θ;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|g;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|τ;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|t;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|\;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|sym;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|id;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|tok;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|key;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|nl;
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|END_OF_FILE
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            completeProduction(4,2,5); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(4,2,5); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State195 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|+>: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|#: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|↦: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|f: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|END_OF_FILE: 24;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(l.id == 26/* \→ */||l.id == 27/* \> */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25: //prd$production_start_symbol
State299(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State196 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(l.id == 26/* \→ */||l.id == 27/* \> */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25: //prd$production_start_symbol
State295(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State200 (l: Lexer): void{
                /*
def$js_id_symbols=>_ •|→;
def$js_id_symbols=>_ •|id;
def$js_id_symbols=>_ •|key;
def$js_id_symbols=>_ •|_;
def$js_id_symbols=>_ •|$;
def$js_id_symbols=>_ •|num;
def$js_id_symbols=>_ •|hex;
def$js_id_symbols=>_ •|bin;
def$js_id_symbols=>_ •|oct;
def$js_id_symbols=>_ •|>;
def$js_id_symbols=>_ •|::;
def$js_id_symbols=>_ •|^;
def$js_id_symbols=>_ •|{;
def$js_id_symbols=>_ •|θ;
def$js_id_symbols=>_ •|g;
def$js_id_symbols=>_ •|τ;
def$js_id_symbols=>_ •|t;
def$js_id_symbols=>_ •|\;
def$js_id_symbols=>_ •|sym;
def$js_id_symbols=>_ •|tok;
def$js_id_symbols=>_ •|nl;
def$js_id_symbols=>_ •|END_OF_FILE;
def$js_id_symbols=>_ •|ws;
def$js_id_symbols=>_ •|$eof;
def$js_id_symbols=>_ •|assert;
def$js_id_symbols=>_ •|shift;
def$js_id_symbols=>_ •|);
def$js_id_symbols=>_ •|?;
def$js_id_symbols=>_ •|(+;
def$js_id_symbols=>_ •|(*;
def$js_id_symbols=>_ •|(;
def$js_id_symbols=>_ •|↦;
def$js_id_symbols=>_ •|f;
def$js_id_symbols=>_ •|│;
def$js_id_symbols=>_ •||;
def$js_id_symbols=>_ •|#;
def$js_id_symbols=>_ •|<>;
def$js_id_symbols=>_ •|+>;
def$js_id_symbols=>_ •|};
def$js_id_symbols=>_ •|];
def$js_id_symbols=>_ •|sci;
def$js_id_symbols=>_ •|flt
*/
if(idm200r.has(l.id)){idm200r.get(l.id)(l); return;} else if(tym200r.has(l.ty)){tym200r.get(l.ty)(l); return;}
else fail(l);
}
    function State201 (l: Lexer): void{
                /*
def$js_id_symbols=>$ •|→;
def$js_id_symbols=>$ •|id;
def$js_id_symbols=>$ •|key;
def$js_id_symbols=>$ •|_;
def$js_id_symbols=>$ •|$;
def$js_id_symbols=>$ •|num;
def$js_id_symbols=>$ •|hex;
def$js_id_symbols=>$ •|bin;
def$js_id_symbols=>$ •|oct;
def$js_id_symbols=>$ •|>;
def$js_id_symbols=>$ •|::;
def$js_id_symbols=>$ •|^;
def$js_id_symbols=>$ •|{;
def$js_id_symbols=>$ •|θ;
def$js_id_symbols=>$ •|g;
def$js_id_symbols=>$ •|τ;
def$js_id_symbols=>$ •|t;
def$js_id_symbols=>$ •|\;
def$js_id_symbols=>$ •|sym;
def$js_id_symbols=>$ •|tok;
def$js_id_symbols=>$ •|nl;
def$js_id_symbols=>$ •|END_OF_FILE;
def$js_id_symbols=>$ •|ws;
def$js_id_symbols=>$ •|$eof;
def$js_id_symbols=>$ •|assert;
def$js_id_symbols=>$ •|shift;
def$js_id_symbols=>$ •|);
def$js_id_symbols=>$ •|?;
def$js_id_symbols=>$ •|(+;
def$js_id_symbols=>$ •|(*;
def$js_id_symbols=>$ •|(;
def$js_id_symbols=>$ •|↦;
def$js_id_symbols=>$ •|f;
def$js_id_symbols=>$ •|│;
def$js_id_symbols=>$ •||;
def$js_id_symbols=>$ •|#;
def$js_id_symbols=>$ •|<>;
def$js_id_symbols=>$ •|+>;
def$js_id_symbols=>$ •|};
def$js_id_symbols=>$ •|];
def$js_id_symbols=>$ •|sci;
def$js_id_symbols=>$ •|flt
*/
if(idm200r.has(l.id)){idm200r.get(l.id)(l); return;} else if(tym200r.has(l.ty)){tym200r.get(l.ty)(l); return;}
else fail(l);
}
    function State202 (l: Lexer): void{
                /*
def$js_id_symbols=>θid •|→;
def$js_id_symbols=>θid •|id;
def$js_id_symbols=>θid •|key;
def$js_id_symbols=>θid •|_;
def$js_id_symbols=>θid •|$;
def$js_id_symbols=>θid •|num;
def$js_id_symbols=>θid •|hex;
def$js_id_symbols=>θid •|bin;
def$js_id_symbols=>θid •|oct;
def$js_id_symbols=>θid •|>;
def$js_id_symbols=>θid •|::;
def$js_id_symbols=>θid •|^;
def$js_id_symbols=>θid •|{;
def$js_id_symbols=>θid •|θ;
def$js_id_symbols=>θid •|g;
def$js_id_symbols=>θid •|τ;
def$js_id_symbols=>θid •|t;
def$js_id_symbols=>θid •|\;
def$js_id_symbols=>θid •|sym;
def$js_id_symbols=>θid •|tok;
def$js_id_symbols=>θid •|nl;
def$js_id_symbols=>θid •|END_OF_FILE;
def$js_id_symbols=>θid •|ws;
def$js_id_symbols=>θid •|$eof;
def$js_id_symbols=>θid •|assert;
def$js_id_symbols=>θid •|shift;
def$js_id_symbols=>θid •|);
def$js_id_symbols=>θid •|?;
def$js_id_symbols=>θid •|(+;
def$js_id_symbols=>θid •|(*;
def$js_id_symbols=>θid •|(;
def$js_id_symbols=>θid •|↦;
def$js_id_symbols=>θid •|f;
def$js_id_symbols=>θid •|│;
def$js_id_symbols=>θid •||;
def$js_id_symbols=>θid •|#;
def$js_id_symbols=>θid •|<>;
def$js_id_symbols=>θid •|+>;
def$js_id_symbols=>θid •|};
def$js_id_symbols=>θid •|];
def$js_id_symbols=>θid •|sci;
def$js_id_symbols=>θid •|flt
*/
if(idm200r.has(l.id)){idm200r.get(l.id)(l); return;} else if(tym200r.has(l.ty)){tym200r.get(l.ty)(l); return;}
else fail(l);
}
    function State204 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|<>: 24;
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|+>: 24;
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|#: 24;
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|↦: 24;
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|f: 24;
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(l.id == 26/* \→ */||l.id == 27/* \> */){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 25: //prd$production_start_symbol
State300(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State213 (l: Lexer): void{
                /*
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|ws;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|nl;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|$eof;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|sym;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|id;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|tok;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|key;
sym$grouped_symbol_HC_listbody1_104=>sym$grouped_symbol_HC_listbody1_104 sym$grouped_symbol_group_013_103 •|END_OF_FILE
*/
if(l.id == 54/* \$eof */){ 
             
            completeProduction(12,2,58); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(12,2,58); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State219 (l: Lexer): void{
                /*
cm$comment_data=>cm$comment_data cm$comment_primitive •|nl;
cm$comment_data=>cm$comment_data cm$comment_primitive •|sym;
cm$comment_data=>cm$comment_data cm$comment_primitive •|tok;
cm$comment_data=>cm$comment_data cm$comment_primitive •|id;
cm$comment_data=>cm$comment_data cm$comment_primitive •|num;
cm$comment_data=>cm$comment_data cm$comment_primitive •|ws;
cm$comment_data=>cm$comment_data cm$comment_primitive •|key;
cm$comment_data=>cm$comment_data cm$comment_primitive •|END_OF_FILE
*/
if(tym219r.has(l.ty)){tym219r.get(l.ty)(l); return;}
else fail(l);
}
    function State227 (l: Lexer): void{
                /*
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|);
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|θ;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|g;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|τ;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|t;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|\;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|assert;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|shift;
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|END_OF_FILE
*/
_skip(l, const__)
if(idm227r.has(l.id)){idm227r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(4,2,50); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State229 (l: Lexer): void{
                /*
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|nl;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|θ;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|g;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|τ;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|t;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|\;
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|END_OF_FILE
*/
_skip(l, const_0_)
if(l.id == 57/* \θ */||l.id == 58/* \g */||l.id == 59/* \τ */||l.id == 60/* \t */||l.id == 61/* \\ */){ 
             
            completeProduction(4,2,54); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 4/* \nl--- */){ 
             
            completeProduction(4,2,54); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function $pb$production_bodies (l: Lexer): void{
                /*
pb$production_bodies=>• pb$production_body|│: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|│: 28;
pb$production_bodies=>• pb$production_body||: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>• pb$production_bodies cm$comment||: 28;
pb$production_bodies=>• pb$production_body|#: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|#: 28;
pb$production_bodies=>• pb$production_body|): 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|): 28;
pb$production_bodies=>• pb$production_bodies cm$comment|): 28;
pb$production_bodies=>• pb$production_body|<>: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|<>: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|<>: 28;
pb$production_bodies=>• pb$production_body|+>: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|+>: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|+>: 28;
pb$production_bodies=>• pb$production_body|↦: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|↦: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|↦: 28;
pb$production_bodies=>• pb$production_body|f: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|f: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|f: 28;
pb$production_bodies=>• pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>• pb$production_bodies cm$comment|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm307.has(l.id)){idm307.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_body(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29: //pb$production_body
State231(l)
 break;
case 28: //pb$production_bodies
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 32/* \) */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State232(cp)
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
    function State231 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_body •|│;
pb$production_bodies=>pb$production_body •||;
pb$production_bodies=>pb$production_body •|#;
pb$production_bodies=>pb$production_body •|);
pb$production_bodies=>pb$production_body •|<>;
pb$production_bodies=>pb$production_body •|+>;
pb$production_bodies=>pb$production_body •|↦;
pb$production_bodies=>pb$production_body •|f;
pb$production_bodies=>pb$production_body •|END_OF_FILE
*/
_skip(l, const__)
if(idm231r.has(l.id)){idm231r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(25,1,28); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State232 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies • cm$comment||: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|#: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|): 28;
pb$production_bodies=>pb$production_bodies • cm$comment|): 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|+>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|+>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|↦: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|↦: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|f: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|f: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm344.has(l.id)){idm344.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State308(l)
 break;
case 27: //pb$production_bodies_group_04_100
State307(l)
 break;
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State234 (l: Lexer): void{
                /*
pb$production_body=>pb$entries •|│;
pb$production_body=>pb$entries •||;
pb$production_body=>pb$entries •|#;
pb$production_body=>pb$entries •|);
pb$production_body=>pb$entries •|<>;
pb$production_body=>pb$entries •|+>;
pb$production_body=>pb$entries •|↦;
pb$production_body=>pb$entries •|f;
pb$production_body=>pb$entries •|END_OF_FILE
*/
_skip(l, const__)
if(idm234r.has(l.id)){idm234r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(29,1,29); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State236 (l: Lexer): void{
                /*
pb$entries=>pb$body_entries • fn$reduce_function|│: 30;
pb$entries=>pb$body_entries •|│;
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|f: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|f: 31;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 31;
pb$body_entries=>pb$body_entries • sym$symbol|f: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|(: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|(: 31;
pb$body_entries=>pb$body_entries • sym$symbol|(: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|θ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|g: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|_: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|$: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|id: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|key: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|τ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|t: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|\: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|assert: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|shift: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|sym: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|tok: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|θ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|g: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|_: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|$: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|id: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|key: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|τ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|t: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|\: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|assert: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|shift: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|sym: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|tok: 31;
pb$body_entries=>pb$body_entries • sym$symbol|θ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|g: 31;
pb$body_entries=>pb$body_entries • sym$symbol|_: 31;
pb$body_entries=>pb$body_entries • sym$symbol|$: 31;
pb$body_entries=>pb$body_entries • sym$symbol|id: 31;
pb$body_entries=>pb$body_entries • sym$symbol|key: 31;
pb$body_entries=>pb$body_entries • sym$symbol|τ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|t: 31;
pb$body_entries=>pb$body_entries • sym$symbol|\: 31;
pb$body_entries=>pb$body_entries • sym$symbol|assert: 31;
pb$body_entries=>pb$body_entries • sym$symbol|shift: 31;
pb$body_entries=>pb$body_entries • sym$symbol|sym: 31;
pb$body_entries=>pb$body_entries • sym$symbol|tok: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|│: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|│: 31;
pb$body_entries=>pb$body_entries • sym$symbol|│: 31;
pb$entries=>pb$body_entries • fn$reduce_function||: 30;
pb$entries=>pb$body_entries •||;
pb$body_entries=>pb$body_entries • fn$function_clause||: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause||: 31;
pb$body_entries=>pb$body_entries • sym$symbol||: 31;
pb$entries=>pb$body_entries • fn$reduce_function|#: 30;
pb$entries=>pb$body_entries •|#;
pb$body_entries=>pb$body_entries • fn$function_clause|#: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|#: 31;
pb$body_entries=>pb$body_entries • sym$symbol|#: 31;
pb$entries=>pb$body_entries • fn$reduce_function|): 30;
pb$entries=>pb$body_entries •|);
pb$body_entries=>pb$body_entries • fn$function_clause|): 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|): 31;
pb$body_entries=>pb$body_entries • sym$symbol|): 31;
pb$entries=>pb$body_entries • fn$reduce_function|<>: 30;
pb$entries=>pb$body_entries •|<>;
pb$body_entries=>pb$body_entries • fn$function_clause|<>: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|<>: 31;
pb$body_entries=>pb$body_entries • sym$symbol|<>: 31;
pb$entries=>pb$body_entries • fn$reduce_function|+>: 30;
pb$entries=>pb$body_entries •|+>;
pb$body_entries=>pb$body_entries • fn$function_clause|+>: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|+>: 31;
pb$body_entries=>pb$body_entries • sym$symbol|+>: 31;
pb$entries=>pb$body_entries • fn$reduce_function|↦: 30;
pb$entries=>pb$body_entries •|↦;
pb$entries=>pb$body_entries • fn$reduce_function|f: 30;
pb$entries=>pb$body_entries •|f;
pb$entries=>pb$body_entries • fn$reduce_function|END_OF_FILE: 30;
pb$entries=>pb$body_entries •|END_OF_FILE;
pb$body_entries=>pb$body_entries • fn$function_clause|END_OF_FILE: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|END_OF_FILE: 31;
pb$body_entries=>pb$body_entries • sym$symbol|END_OF_FILE: 31
*/
_skip(l, const__)
if(idm236.has(l.id)){idm236.get(l.id)(l); } else if(idm236r.has(l.id)){idm236r.get(l.id)(l); return;} else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$symbol(l); stack_ptr++;
             
            } else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(33,1,30); stack_ptr-=1;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State338(l)
 break;
case 38: //fn$function_clause
State336(l)
 break;
case 37: //fn$reduce_function
State335(l)
 break;
case 33: //pb$condition_clause
State337(l)
 break;
case 30/*pb$entries*/:
case 31/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State239 (l: Lexer): void{
                /*
pb$body_entries=>pb$condition_clause •|↦;
pb$body_entries=>pb$condition_clause •|f;
pb$body_entries=>pb$condition_clause •|(;
pb$body_entries=>pb$condition_clause •|θ;
pb$body_entries=>pb$condition_clause •|g;
pb$body_entries=>pb$condition_clause •|_;
pb$body_entries=>pb$condition_clause •|$;
pb$body_entries=>pb$condition_clause •|id;
pb$body_entries=>pb$condition_clause •|key;
pb$body_entries=>pb$condition_clause •|τ;
pb$body_entries=>pb$condition_clause •|t;
pb$body_entries=>pb$condition_clause •|\;
pb$body_entries=>pb$condition_clause •|assert;
pb$body_entries=>pb$condition_clause •|shift;
pb$body_entries=>pb$condition_clause •|sym;
pb$body_entries=>pb$condition_clause •|tok;
pb$body_entries=>pb$condition_clause •|│;
pb$body_entries=>pb$condition_clause •||;
pb$body_entries=>pb$condition_clause •|#;
pb$body_entries=>pb$condition_clause •|);
pb$body_entries=>pb$condition_clause •|<>;
pb$body_entries=>pb$condition_clause •|+>;
pb$body_entries=>pb$condition_clause •|END_OF_FILE;
pb$body_entries=>pb$condition_clause •|]
*/
_skip(l, const__)
if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(34,1,31); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State240 (l: Lexer): void{
                /*
pb$body_entries=>fn$function_clause •|↦;
pb$body_entries=>fn$function_clause •|f;
pb$body_entries=>fn$function_clause •|(;
pb$body_entries=>fn$function_clause •|θ;
pb$body_entries=>fn$function_clause •|g;
pb$body_entries=>fn$function_clause •|_;
pb$body_entries=>fn$function_clause •|$;
pb$body_entries=>fn$function_clause •|id;
pb$body_entries=>fn$function_clause •|key;
pb$body_entries=>fn$function_clause •|τ;
pb$body_entries=>fn$function_clause •|t;
pb$body_entries=>fn$function_clause •|\;
pb$body_entries=>fn$function_clause •|assert;
pb$body_entries=>fn$function_clause •|shift;
pb$body_entries=>fn$function_clause •|sym;
pb$body_entries=>fn$function_clause •|tok;
pb$body_entries=>fn$function_clause •|│;
pb$body_entries=>fn$function_clause •||;
pb$body_entries=>fn$function_clause •|#;
pb$body_entries=>fn$function_clause •|);
pb$body_entries=>fn$function_clause •|<>;
pb$body_entries=>fn$function_clause •|+>;
pb$body_entries=>fn$function_clause •|END_OF_FILE;
pb$body_entries=>fn$function_clause •|]
*/
_skip(l, const__)
if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(34,1,31); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State241 (l: Lexer): void{
                /*
pb$body_entries=>[ • pb$body_entries ]|↦: 31;
pb$body_entries=>[ • pb$body_entries ]|f: 31;
pb$body_entries=>[ • pb$body_entries ]|(: 31;
pb$body_entries=>[ • pb$body_entries ]|θ: 31;
pb$body_entries=>[ • pb$body_entries ]|g: 31;
pb$body_entries=>[ • pb$body_entries ]|_: 31;
pb$body_entries=>[ • pb$body_entries ]|$: 31;
pb$body_entries=>[ • pb$body_entries ]|id: 31;
pb$body_entries=>[ • pb$body_entries ]|key: 31;
pb$body_entries=>[ • pb$body_entries ]|τ: 31;
pb$body_entries=>[ • pb$body_entries ]|t: 31;
pb$body_entries=>[ • pb$body_entries ]|\: 31;
pb$body_entries=>[ • pb$body_entries ]|assert: 31;
pb$body_entries=>[ • pb$body_entries ]|shift: 31;
pb$body_entries=>[ • pb$body_entries ]|sym: 31;
pb$body_entries=>[ • pb$body_entries ]|tok: 31;
pb$body_entries=>[ • pb$body_entries ]|│: 31;
pb$body_entries=>[ • pb$body_entries ]||: 31;
pb$body_entries=>[ • pb$body_entries ]|#: 31;
pb$body_entries=>[ • pb$body_entries ]|): 31;
pb$body_entries=>[ • pb$body_entries ]|<>: 31;
pb$body_entries=>[ • pb$body_entries ]|+>: 31;
pb$body_entries=>[ • pb$body_entries ]|END_OF_FILE: 31;
pb$body_entries=>[ • pb$body_entries ]|]: 31
*/
_skip(l, const__)
if(idm241.has(l.id)){idm241.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$body_entries(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 31: //pb$body_entries
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 24/* \│ */||l.id == 25/* \| */||l.id == 32/* \) */||l.id == 50/* \# */||l.ty == 0 /*--*//* EOF */){ return;}
State342(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State242 (l: Lexer): void{
                /*
pb$body_entries=>sym$symbol •|↦;
pb$body_entries=>sym$symbol •|f;
pb$body_entries=>sym$symbol •|(;
pb$body_entries=>sym$symbol •|θ;
pb$body_entries=>sym$symbol •|g;
pb$body_entries=>sym$symbol •|_;
pb$body_entries=>sym$symbol •|$;
pb$body_entries=>sym$symbol •|id;
pb$body_entries=>sym$symbol •|key;
pb$body_entries=>sym$symbol •|τ;
pb$body_entries=>sym$symbol •|t;
pb$body_entries=>sym$symbol •|\;
pb$body_entries=>sym$symbol •|assert;
pb$body_entries=>sym$symbol •|shift;
pb$body_entries=>sym$symbol •|sym;
pb$body_entries=>sym$symbol •|tok;
sym$symbol=>sym$symbol • ?|θ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|θ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|θ: 63;
sym$symbol=>sym$symbol • ?|?;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|?: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|?: 63;
sym$symbol=>sym$symbol • ?|(+;
sym$symbol=>sym$symbol • ?|(*;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(+: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(*: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(+: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(*: 63;
sym$symbol=>sym$symbol • ?|g;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|g: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|g: 63;
sym$symbol=>sym$symbol • ?|_;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|_: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|_: 63;
sym$symbol=>sym$symbol • ?|$;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|$: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|$: 63;
sym$symbol=>sym$symbol • ?|id;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|id: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|id: 63;
sym$symbol=>sym$symbol • ?|key;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|key: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|key: 63;
sym$symbol=>sym$symbol • ?|τ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|τ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|τ: 63;
sym$symbol=>sym$symbol • ?|t;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|t: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|t: 63;
sym$symbol=>sym$symbol • ?|\;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|\: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|\: 63;
sym$symbol=>sym$symbol • ?|assert;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|assert: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|assert: 63;
sym$symbol=>sym$symbol • ?|shift;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|shift: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|shift: 63;
sym$symbol=>sym$symbol • ?|sym;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|sym: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|sym: 63;
sym$symbol=>sym$symbol • ?|tok;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|tok: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|tok: 63;
sym$symbol=>sym$symbol • ?|(;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(: 63;
sym$symbol=>sym$symbol • ?|↦;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|↦: 63;
sym$symbol=>sym$symbol • ?|f;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|f: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|f: 63;
pb$body_entries=>sym$symbol •|│;
sym$symbol=>sym$symbol • ?|│;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|│: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|│: 63;
pb$body_entries=>sym$symbol •||;
sym$symbol=>sym$symbol • ?||;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )||: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )||: 63;
pb$body_entries=>sym$symbol •|#;
sym$symbol=>sym$symbol • ?|#;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|#: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|#: 63;
pb$body_entries=>sym$symbol •|);
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|): 63;
pb$body_entries=>sym$symbol •|<>;
sym$symbol=>sym$symbol • ?|<>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|<>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|<>: 63;
pb$body_entries=>sym$symbol •|+>;
sym$symbol=>sym$symbol • ?|+>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|+>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|+>: 63;
pb$body_entries=>sym$symbol •|END_OF_FILE;
sym$symbol=>sym$symbol • ?|END_OF_FILE;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|END_OF_FILE: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|END_OF_FILE: 63;
pb$body_entries=>sym$symbol •|];
sym$symbol=>sym$symbol • ?|];
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|]: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|]: 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); } else if(idm242r.has(l.id)){idm242r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(34,1,31); stack_ptr-=1;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_031_105
State315(l)
 break;
case 31/*pb$body_entries*/:
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State244 (l: Lexer): void{
                /*
sym$symbol=>sym$generated_symbol •|θ;
sym$symbol=>sym$generated_symbol •|?;
sym$symbol=>sym$generated_symbol •|(+;
sym$symbol=>sym$generated_symbol •|(*;
sym$symbol=>sym$generated_symbol •|g;
sym$symbol=>sym$generated_symbol •|_;
sym$symbol=>sym$generated_symbol •|$;
sym$symbol=>sym$generated_symbol •|id;
sym$symbol=>sym$generated_symbol •|key;
sym$symbol=>sym$generated_symbol •|τ;
sym$symbol=>sym$generated_symbol •|t;
sym$symbol=>sym$generated_symbol •|\;
sym$symbol=>sym$generated_symbol •|assert;
sym$symbol=>sym$generated_symbol •|shift;
sym$symbol=>sym$generated_symbol •|sym;
sym$symbol=>sym$generated_symbol •|tok;
sym$symbol=>sym$generated_symbol •|(;
sym$symbol=>sym$generated_symbol •|↦;
sym$symbol=>sym$generated_symbol •|f;
sym$symbol=>sym$generated_symbol •|│;
sym$symbol=>sym$generated_symbol •||;
sym$symbol=>sym$generated_symbol •|#;
sym$symbol=>sym$generated_symbol •|);
sym$symbol=>sym$generated_symbol •|<>;
sym$symbol=>sym$generated_symbol •|+>;
sym$symbol=>sym$generated_symbol •|END_OF_FILE;
sym$symbol=>sym$generated_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State245 (l: Lexer): void{
                /*
sym$symbol=>sym$production_symbol •|θ;
sym$symbol=>sym$production_symbol •|?;
sym$symbol=>sym$production_symbol •|(+;
sym$symbol=>sym$production_symbol •|(*;
sym$symbol=>sym$production_symbol •|g;
sym$symbol=>sym$production_symbol •|_;
sym$symbol=>sym$production_symbol •|$;
sym$symbol=>sym$production_symbol •|id;
sym$symbol=>sym$production_symbol •|key;
sym$symbol=>sym$production_symbol •|τ;
sym$symbol=>sym$production_symbol •|t;
sym$symbol=>sym$production_symbol •|\;
sym$symbol=>sym$production_symbol •|assert;
sym$symbol=>sym$production_symbol •|shift;
sym$symbol=>sym$production_symbol •|sym;
sym$symbol=>sym$production_symbol •|tok;
sym$symbol=>sym$production_symbol •|(;
sym$symbol=>sym$production_symbol •|↦;
sym$symbol=>sym$production_symbol •|f;
sym$symbol=>sym$production_symbol •|│;
sym$symbol=>sym$production_symbol •||;
sym$symbol=>sym$production_symbol •|#;
sym$symbol=>sym$production_symbol •|);
sym$symbol=>sym$production_symbol •|<>;
sym$symbol=>sym$production_symbol •|+>;
sym$symbol=>sym$production_symbol •|END_OF_FILE;
sym$symbol=>sym$production_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State246 (l: Lexer): void{
                /*
sym$symbol=>sym$imported_production_symbol •|θ;
sym$symbol=>sym$imported_production_symbol •|?;
sym$symbol=>sym$imported_production_symbol •|(+;
sym$symbol=>sym$imported_production_symbol •|(*;
sym$symbol=>sym$imported_production_symbol •|g;
sym$symbol=>sym$imported_production_symbol •|_;
sym$symbol=>sym$imported_production_symbol •|$;
sym$symbol=>sym$imported_production_symbol •|id;
sym$symbol=>sym$imported_production_symbol •|key;
sym$symbol=>sym$imported_production_symbol •|τ;
sym$symbol=>sym$imported_production_symbol •|t;
sym$symbol=>sym$imported_production_symbol •|\;
sym$symbol=>sym$imported_production_symbol •|assert;
sym$symbol=>sym$imported_production_symbol •|shift;
sym$symbol=>sym$imported_production_symbol •|sym;
sym$symbol=>sym$imported_production_symbol •|tok;
sym$symbol=>sym$imported_production_symbol •|(;
sym$symbol=>sym$imported_production_symbol •|↦;
sym$symbol=>sym$imported_production_symbol •|f;
sym$symbol=>sym$imported_production_symbol •|│;
sym$symbol=>sym$imported_production_symbol •||;
sym$symbol=>sym$imported_production_symbol •|#;
sym$symbol=>sym$imported_production_symbol •|);
sym$symbol=>sym$imported_production_symbol •|<>;
sym$symbol=>sym$imported_production_symbol •|+>;
sym$symbol=>sym$imported_production_symbol •|END_OF_FILE;
sym$symbol=>sym$imported_production_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State247 (l: Lexer): void{
                /*
sym$symbol=>sym$literal_symbol •|θ;
sym$symbol=>sym$literal_symbol •|?;
sym$symbol=>sym$literal_symbol •|(+;
sym$symbol=>sym$literal_symbol •|(*;
sym$symbol=>sym$literal_symbol •|g;
sym$symbol=>sym$literal_symbol •|_;
sym$symbol=>sym$literal_symbol •|$;
sym$symbol=>sym$literal_symbol •|id;
sym$symbol=>sym$literal_symbol •|key;
sym$symbol=>sym$literal_symbol •|τ;
sym$symbol=>sym$literal_symbol •|t;
sym$symbol=>sym$literal_symbol •|\;
sym$symbol=>sym$literal_symbol •|assert;
sym$symbol=>sym$literal_symbol •|shift;
sym$symbol=>sym$literal_symbol •|sym;
sym$symbol=>sym$literal_symbol •|tok;
sym$symbol=>sym$literal_symbol •|(;
sym$symbol=>sym$literal_symbol •|↦;
sym$symbol=>sym$literal_symbol •|f;
sym$symbol=>sym$literal_symbol •|│;
sym$symbol=>sym$literal_symbol •||;
sym$symbol=>sym$literal_symbol •|#;
sym$symbol=>sym$literal_symbol •|);
sym$symbol=>sym$literal_symbol •|<>;
sym$symbol=>sym$literal_symbol •|+>;
sym$symbol=>sym$literal_symbol •|END_OF_FILE;
sym$symbol=>sym$literal_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State248 (l: Lexer): void{
                /*
sym$symbol=>sym$escaped_symbol •|θ;
sym$symbol=>sym$escaped_symbol •|?;
sym$symbol=>sym$escaped_symbol •|(+;
sym$symbol=>sym$escaped_symbol •|(*;
sym$symbol=>sym$escaped_symbol •|g;
sym$symbol=>sym$escaped_symbol •|_;
sym$symbol=>sym$escaped_symbol •|$;
sym$symbol=>sym$escaped_symbol •|id;
sym$symbol=>sym$escaped_symbol •|key;
sym$symbol=>sym$escaped_symbol •|τ;
sym$symbol=>sym$escaped_symbol •|t;
sym$symbol=>sym$escaped_symbol •|\;
sym$symbol=>sym$escaped_symbol •|assert;
sym$symbol=>sym$escaped_symbol •|shift;
sym$symbol=>sym$escaped_symbol •|sym;
sym$symbol=>sym$escaped_symbol •|tok;
sym$symbol=>sym$escaped_symbol •|(;
sym$symbol=>sym$escaped_symbol •|↦;
sym$symbol=>sym$escaped_symbol •|f;
sym$symbol=>sym$escaped_symbol •|│;
sym$symbol=>sym$escaped_symbol •||;
sym$symbol=>sym$escaped_symbol •|#;
sym$symbol=>sym$escaped_symbol •|);
sym$symbol=>sym$escaped_symbol •|<>;
sym$symbol=>sym$escaped_symbol •|+>;
sym$symbol=>sym$escaped_symbol •|END_OF_FILE;
sym$symbol=>sym$escaped_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State249 (l: Lexer): void{
                /*
sym$symbol=>sym$assert_function_symbol •|θ;
sym$symbol=>sym$assert_function_symbol •|?;
sym$symbol=>sym$assert_function_symbol •|(+;
sym$symbol=>sym$assert_function_symbol •|(*;
sym$symbol=>sym$assert_function_symbol •|g;
sym$symbol=>sym$assert_function_symbol •|_;
sym$symbol=>sym$assert_function_symbol •|$;
sym$symbol=>sym$assert_function_symbol •|id;
sym$symbol=>sym$assert_function_symbol •|key;
sym$symbol=>sym$assert_function_symbol •|τ;
sym$symbol=>sym$assert_function_symbol •|t;
sym$symbol=>sym$assert_function_symbol •|\;
sym$symbol=>sym$assert_function_symbol •|assert;
sym$symbol=>sym$assert_function_symbol •|shift;
sym$symbol=>sym$assert_function_symbol •|sym;
sym$symbol=>sym$assert_function_symbol •|tok;
sym$symbol=>sym$assert_function_symbol •|(;
sym$symbol=>sym$assert_function_symbol •|↦;
sym$symbol=>sym$assert_function_symbol •|f;
sym$symbol=>sym$assert_function_symbol •|│;
sym$symbol=>sym$assert_function_symbol •||;
sym$symbol=>sym$assert_function_symbol •|#;
sym$symbol=>sym$assert_function_symbol •|);
sym$symbol=>sym$assert_function_symbol •|<>;
sym$symbol=>sym$assert_function_symbol •|+>;
sym$symbol=>sym$assert_function_symbol •|END_OF_FILE;
sym$symbol=>sym$assert_function_symbol •|]
*/
_skip(l, const__)
if(idm246r.has(l.id)){idm246r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProductionPlain(1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State250 (l: Lexer): void{
                /*
sym$symbol=>θsym •|θ;
sym$symbol=>θsym •|?;
sym$symbol=>θsym •|(+;
sym$symbol=>θsym •|(*;
sym$symbol=>θsym •|g;
sym$symbol=>θsym •|_;
sym$symbol=>θsym •|$;
sym$symbol=>θsym •|id;
sym$symbol=>θsym •|key;
sym$symbol=>θsym •|τ;
sym$symbol=>θsym •|t;
sym$symbol=>θsym •|\;
sym$symbol=>θsym •|assert;
sym$symbol=>θsym •|shift;
sym$symbol=>θsym •|sym;
sym$symbol=>θsym •|tok;
sym$symbol=>θsym •|(;
sym$symbol=>θsym •|↦;
sym$symbol=>θsym •|f;
sym$symbol=>θsym •|│;
sym$symbol=>θsym •||;
sym$symbol=>θsym •|#;
sym$symbol=>θsym •|);
sym$symbol=>θsym •|<>;
sym$symbol=>θsym •|+>;
sym$symbol=>θsym •|END_OF_FILE;
sym$symbol=>θsym •|]
*/
_skip(l, const__)
if(idm250r.has(l.id)){idm250r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(54,1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State251 (l: Lexer): void{
                /*
sym$symbol=>θtok •|θ;
sym$symbol=>θtok •|?;
sym$symbol=>θtok •|(+;
sym$symbol=>θtok •|(*;
sym$symbol=>θtok •|g;
sym$symbol=>θtok •|_;
sym$symbol=>θtok •|$;
sym$symbol=>θtok •|id;
sym$symbol=>θtok •|key;
sym$symbol=>θtok •|τ;
sym$symbol=>θtok •|t;
sym$symbol=>θtok •|\;
sym$symbol=>θtok •|assert;
sym$symbol=>θtok •|shift;
sym$symbol=>θtok •|sym;
sym$symbol=>θtok •|tok;
sym$symbol=>θtok •|(;
sym$symbol=>θtok •|↦;
sym$symbol=>θtok •|f;
sym$symbol=>θtok •|│;
sym$symbol=>θtok •||;
sym$symbol=>θtok •|#;
sym$symbol=>θtok •|);
sym$symbol=>θtok •|<>;
sym$symbol=>θtok •|+>;
sym$symbol=>θtok •|END_OF_FILE;
sym$symbol=>θtok •|]
*/
_skip(l, const__)
if(idm250r.has(l.id)){idm250r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(54,1,63); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State254 (l: Lexer): void{
                /*
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|sym;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|id;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|tok;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|key;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|ws;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|nl;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|$eof;
sym$escaped_symbol_HC_listbody1_109=>sym$escaped_symbol_HC_listbody1_109 sym$grouped_symbol_group_013_103 •|END_OF_FILE
*/
if(l.id == 54/* \$eof */){ 
             
            completeProduction(12,2,72); stack_ptr-=2;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 3/* \id--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(12,2,72); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State256 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data fn$js_primitive •|};
fn$js_data=>fn$js_data fn$js_primitive •|id;
fn$js_data=>fn$js_data fn$js_primitive •|num;
fn$js_data=>fn$js_data fn$js_primitive •|ws;
fn$js_data=>fn$js_data fn$js_primitive •|sym;
fn$js_data=>fn$js_data fn$js_primitive •|tok;
fn$js_data=>fn$js_data fn$js_primitive •|key;
fn$js_data=>fn$js_data fn$js_primitive •|θ;
fn$js_data=>fn$js_data fn$js_primitive •|g;
fn$js_data=>fn$js_data fn$js_primitive •|τ;
fn$js_data=>fn$js_data fn$js_primitive •|t;
fn$js_data=>fn$js_data fn$js_primitive •|\;
fn$js_data=>fn$js_data fn$js_primitive •|$eof;
fn$js_data=>fn$js_data fn$js_primitive •|{;
fn$js_data=>fn$js_data fn$js_primitive •|END_OF_FILE
*/
_skip(l, const_1_)
if(idm257r.has(l.id)){idm257r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(12,2,39); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State257 (l: Lexer): void{
                /*
fn$js_data=>fn$js_data fn$js_data_block •|};
fn$js_data=>fn$js_data fn$js_data_block •|id;
fn$js_data=>fn$js_data fn$js_data_block •|num;
fn$js_data=>fn$js_data fn$js_data_block •|ws;
fn$js_data=>fn$js_data fn$js_data_block •|sym;
fn$js_data=>fn$js_data fn$js_data_block •|tok;
fn$js_data=>fn$js_data fn$js_data_block •|key;
fn$js_data=>fn$js_data fn$js_data_block •|θ;
fn$js_data=>fn$js_data fn$js_data_block •|g;
fn$js_data=>fn$js_data fn$js_data_block •|τ;
fn$js_data=>fn$js_data fn$js_data_block •|t;
fn$js_data=>fn$js_data fn$js_data_block •|\;
fn$js_data=>fn$js_data fn$js_data_block •|$eof;
fn$js_data=>fn$js_data fn$js_data_block •|{;
fn$js_data=>fn$js_data fn$js_data_block •|END_OF_FILE
*/
_skip(l, const_1_)
if(idm257r.has(l.id)){idm257r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 2/* \num--- */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(12,2,39); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function $def$js_id_symbols (l: Lexer): void{
                /*
def$js_id_symbols=>• def$js_id_symbols θid|id: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|id: 101;
def$js_id_symbols=>• def$js_id_symbols _|id: 101;
def$js_id_symbols=>• def$js_id_symbols $|id: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|id: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|id: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|id: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|id: 101;
def$js_id_symbols=>• _|id;
def$js_id_symbols=>• $|id;
def$js_id_symbols=>• θid|id;
def$js_id_symbols=>• θkey|id;
def$js_id_symbols=>• def$js_id_symbols θid|key: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|key: 101;
def$js_id_symbols=>• def$js_id_symbols _|key: 101;
def$js_id_symbols=>• def$js_id_symbols $|key: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|key: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|key: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|key: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|key: 101;
def$js_id_symbols=>• _|key;
def$js_id_symbols=>• $|key;
def$js_id_symbols=>• θid|key;
def$js_id_symbols=>• θkey|key;
def$js_id_symbols=>• def$js_id_symbols θid|_: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|_: 101;
def$js_id_symbols=>• def$js_id_symbols _|_: 101;
def$js_id_symbols=>• def$js_id_symbols $|_: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|_: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|_: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|_: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|_: 101;
def$js_id_symbols=>• _|_;
def$js_id_symbols=>• $|_;
def$js_id_symbols=>• θid|_;
def$js_id_symbols=>• θkey|_;
def$js_id_symbols=>• def$js_id_symbols θid|$: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|$: 101;
def$js_id_symbols=>• def$js_id_symbols _|$: 101;
def$js_id_symbols=>• def$js_id_symbols $|$: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|$: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|$: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|$: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|$: 101;
def$js_id_symbols=>• _|$;
def$js_id_symbols=>• $|$;
def$js_id_symbols=>• θid|$;
def$js_id_symbols=>• θkey|$;
def$js_id_symbols=>• def$js_id_symbols θid|num: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|num: 101;
def$js_id_symbols=>• def$js_id_symbols _|num: 101;
def$js_id_symbols=>• def$js_id_symbols $|num: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|num: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|num: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|num: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|num: 101;
def$js_id_symbols=>• _|num;
def$js_id_symbols=>• $|num;
def$js_id_symbols=>• θid|num;
def$js_id_symbols=>• θkey|num;
def$js_id_symbols=>• def$js_id_symbols θid|hex: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|hex: 101;
def$js_id_symbols=>• def$js_id_symbols _|hex: 101;
def$js_id_symbols=>• def$js_id_symbols $|hex: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|hex: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|hex: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|hex: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|hex: 101;
def$js_id_symbols=>• _|hex;
def$js_id_symbols=>• $|hex;
def$js_id_symbols=>• θid|hex;
def$js_id_symbols=>• θkey|hex;
def$js_id_symbols=>• def$js_id_symbols θid|bin: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|bin: 101;
def$js_id_symbols=>• def$js_id_symbols _|bin: 101;
def$js_id_symbols=>• def$js_id_symbols $|bin: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|bin: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|bin: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|bin: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|bin: 101;
def$js_id_symbols=>• _|bin;
def$js_id_symbols=>• $|bin;
def$js_id_symbols=>• θid|bin;
def$js_id_symbols=>• θkey|bin;
def$js_id_symbols=>• def$js_id_symbols θid|oct: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|oct: 101;
def$js_id_symbols=>• def$js_id_symbols _|oct: 101;
def$js_id_symbols=>• def$js_id_symbols $|oct: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|oct: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|oct: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|oct: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|oct: 101;
def$js_id_symbols=>• _|oct;
def$js_id_symbols=>• $|oct;
def$js_id_symbols=>• θid|oct;
def$js_id_symbols=>• θkey|oct;
def$js_id_symbols=>• def$js_id_symbols θid|nl: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|nl: 101;
def$js_id_symbols=>• def$js_id_symbols _|nl: 101;
def$js_id_symbols=>• def$js_id_symbols $|nl: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|nl: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|nl: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|nl: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|nl: 101;
def$js_id_symbols=>• _|nl;
def$js_id_symbols=>• $|nl;
def$js_id_symbols=>• θid|nl;
def$js_id_symbols=>• θkey|nl;
def$js_id_symbols=>• def$js_id_symbols θid|^: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|^: 101;
def$js_id_symbols=>• def$js_id_symbols _|^: 101;
def$js_id_symbols=>• def$js_id_symbols $|^: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|^: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|^: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|^: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|^: 101;
def$js_id_symbols=>• _|^;
def$js_id_symbols=>• $|^;
def$js_id_symbols=>• θid|^;
def$js_id_symbols=>• θkey|^;
def$js_id_symbols=>• def$js_id_symbols θid|{: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|{: 101;
def$js_id_symbols=>• def$js_id_symbols _|{: 101;
def$js_id_symbols=>• def$js_id_symbols $|{: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|{: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|{: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|{: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|{: 101;
def$js_id_symbols=>• _|{;
def$js_id_symbols=>• $|{;
def$js_id_symbols=>• θid|{;
def$js_id_symbols=>• θkey|{;
def$js_id_symbols=>• def$js_id_symbols θid|): 101;
def$js_id_symbols=>• def$js_id_symbols θkey|): 101;
def$js_id_symbols=>• def$js_id_symbols _|): 101;
def$js_id_symbols=>• def$js_id_symbols $|): 101;
def$js_id_symbols=>• def$js_id_symbols θnum|): 101;
def$js_id_symbols=>• def$js_id_symbols θhex|): 101;
def$js_id_symbols=>• def$js_id_symbols θbin|): 101;
def$js_id_symbols=>• def$js_id_symbols θoct|): 101;
def$js_id_symbols=>• _|);
def$js_id_symbols=>• $|);
def$js_id_symbols=>• θid|);
def$js_id_symbols=>• θkey|);
def$js_id_symbols=>• def$js_id_symbols θid|θ: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|θ: 101;
def$js_id_symbols=>• def$js_id_symbols _|θ: 101;
def$js_id_symbols=>• def$js_id_symbols $|θ: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|θ: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|θ: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|θ: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|θ: 101;
def$js_id_symbols=>• _|θ;
def$js_id_symbols=>• $|θ;
def$js_id_symbols=>• θid|θ;
def$js_id_symbols=>• θkey|θ;
def$js_id_symbols=>• def$js_id_symbols θid|g: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|g: 101;
def$js_id_symbols=>• def$js_id_symbols _|g: 101;
def$js_id_symbols=>• def$js_id_symbols $|g: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|g: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|g: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|g: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|g: 101;
def$js_id_symbols=>• _|g;
def$js_id_symbols=>• $|g;
def$js_id_symbols=>• θid|g;
def$js_id_symbols=>• θkey|g;
def$js_id_symbols=>• def$js_id_symbols θid|τ: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|τ: 101;
def$js_id_symbols=>• def$js_id_symbols _|τ: 101;
def$js_id_symbols=>• def$js_id_symbols $|τ: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|τ: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|τ: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|τ: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|τ: 101;
def$js_id_symbols=>• _|τ;
def$js_id_symbols=>• $|τ;
def$js_id_symbols=>• θid|τ;
def$js_id_symbols=>• θkey|τ;
def$js_id_symbols=>• def$js_id_symbols θid|t: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|t: 101;
def$js_id_symbols=>• def$js_id_symbols _|t: 101;
def$js_id_symbols=>• def$js_id_symbols $|t: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|t: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|t: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|t: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|t: 101;
def$js_id_symbols=>• _|t;
def$js_id_symbols=>• $|t;
def$js_id_symbols=>• θid|t;
def$js_id_symbols=>• θkey|t;
def$js_id_symbols=>• def$js_id_symbols θid|\: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|\: 101;
def$js_id_symbols=>• def$js_id_symbols _|\: 101;
def$js_id_symbols=>• def$js_id_symbols $|\: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|\: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|\: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|\: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|\: 101;
def$js_id_symbols=>• _|\;
def$js_id_symbols=>• $|\;
def$js_id_symbols=>• θid|\;
def$js_id_symbols=>• θkey|\;
def$js_id_symbols=>• def$js_id_symbols θid|assert: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|assert: 101;
def$js_id_symbols=>• def$js_id_symbols _|assert: 101;
def$js_id_symbols=>• def$js_id_symbols $|assert: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|assert: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|assert: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|assert: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|assert: 101;
def$js_id_symbols=>• _|assert;
def$js_id_symbols=>• $|assert;
def$js_id_symbols=>• θid|assert;
def$js_id_symbols=>• θkey|assert;
def$js_id_symbols=>• def$js_id_symbols θid|shift: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|shift: 101;
def$js_id_symbols=>• def$js_id_symbols _|shift: 101;
def$js_id_symbols=>• def$js_id_symbols $|shift: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|shift: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|shift: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|shift: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|shift: 101;
def$js_id_symbols=>• _|shift;
def$js_id_symbols=>• $|shift;
def$js_id_symbols=>• θid|shift;
def$js_id_symbols=>• θkey|shift;
def$js_id_symbols=>• def$js_id_symbols θid|?: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|?: 101;
def$js_id_symbols=>• def$js_id_symbols _|?: 101;
def$js_id_symbols=>• def$js_id_symbols $|?: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|?: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|?: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|?: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|?: 101;
def$js_id_symbols=>• _|?;
def$js_id_symbols=>• $|?;
def$js_id_symbols=>• θid|?;
def$js_id_symbols=>• θkey|?;
def$js_id_symbols=>• def$js_id_symbols θid|(+: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|(+: 101;
def$js_id_symbols=>• def$js_id_symbols _|(+: 101;
def$js_id_symbols=>• def$js_id_symbols $|(+: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|(+: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|(+: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|(+: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|(+: 101;
def$js_id_symbols=>• _|(+;
def$js_id_symbols=>• $|(+;
def$js_id_symbols=>• θid|(+;
def$js_id_symbols=>• θkey|(+;
def$js_id_symbols=>• def$js_id_symbols θid|(*: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|(*: 101;
def$js_id_symbols=>• def$js_id_symbols _|(*: 101;
def$js_id_symbols=>• def$js_id_symbols $|(*: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|(*: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|(*: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|(*: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|(*: 101;
def$js_id_symbols=>• _|(*;
def$js_id_symbols=>• $|(*;
def$js_id_symbols=>• θid|(*;
def$js_id_symbols=>• θkey|(*;
def$js_id_symbols=>• def$js_id_symbols θid|↦: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|↦: 101;
def$js_id_symbols=>• def$js_id_symbols _|↦: 101;
def$js_id_symbols=>• def$js_id_symbols $|↦: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|↦: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|↦: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|↦: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|↦: 101;
def$js_id_symbols=>• _|↦;
def$js_id_symbols=>• $|↦;
def$js_id_symbols=>• θid|↦;
def$js_id_symbols=>• θkey|↦;
def$js_id_symbols=>• def$js_id_symbols θid|f: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|f: 101;
def$js_id_symbols=>• def$js_id_symbols _|f: 101;
def$js_id_symbols=>• def$js_id_symbols $|f: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|f: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|f: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|f: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|f: 101;
def$js_id_symbols=>• _|f;
def$js_id_symbols=>• $|f;
def$js_id_symbols=>• θid|f;
def$js_id_symbols=>• θkey|f;
def$js_id_symbols=>• def$js_id_symbols θid|(: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|(: 101;
def$js_id_symbols=>• def$js_id_symbols _|(: 101;
def$js_id_symbols=>• def$js_id_symbols $|(: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|(: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|(: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|(: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|(: 101;
def$js_id_symbols=>• _|(;
def$js_id_symbols=>• $|(;
def$js_id_symbols=>• θid|(;
def$js_id_symbols=>• θkey|(;
def$js_id_symbols=>• def$js_id_symbols θid|sym: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|sym: 101;
def$js_id_symbols=>• def$js_id_symbols _|sym: 101;
def$js_id_symbols=>• def$js_id_symbols $|sym: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|sym: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|sym: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|sym: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|sym: 101;
def$js_id_symbols=>• _|sym;
def$js_id_symbols=>• $|sym;
def$js_id_symbols=>• θid|sym;
def$js_id_symbols=>• θkey|sym;
def$js_id_symbols=>• def$js_id_symbols θid|tok: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|tok: 101;
def$js_id_symbols=>• def$js_id_symbols _|tok: 101;
def$js_id_symbols=>• def$js_id_symbols $|tok: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|tok: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|tok: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|tok: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|tok: 101;
def$js_id_symbols=>• _|tok;
def$js_id_symbols=>• $|tok;
def$js_id_symbols=>• θid|tok;
def$js_id_symbols=>• θkey|tok;
def$js_id_symbols=>• def$js_id_symbols θid|]: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|]: 101;
def$js_id_symbols=>• def$js_id_symbols _|]: 101;
def$js_id_symbols=>• def$js_id_symbols $|]: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|]: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|]: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|]: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|]: 101;
def$js_id_symbols=>• _|];
def$js_id_symbols=>• $|];
def$js_id_symbols=>• θid|];
def$js_id_symbols=>• θkey|];
def$js_id_symbols=>• def$js_id_symbols θid|│: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|│: 101;
def$js_id_symbols=>• def$js_id_symbols _|│: 101;
def$js_id_symbols=>• def$js_id_symbols $|│: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|│: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|│: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|│: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|│: 101;
def$js_id_symbols=>• _|│;
def$js_id_symbols=>• $|│;
def$js_id_symbols=>• θid|│;
def$js_id_symbols=>• θkey|│;
def$js_id_symbols=>• def$js_id_symbols θid||: 101;
def$js_id_symbols=>• def$js_id_symbols θkey||: 101;
def$js_id_symbols=>• def$js_id_symbols _||: 101;
def$js_id_symbols=>• def$js_id_symbols $||: 101;
def$js_id_symbols=>• def$js_id_symbols θnum||: 101;
def$js_id_symbols=>• def$js_id_symbols θhex||: 101;
def$js_id_symbols=>• def$js_id_symbols θbin||: 101;
def$js_id_symbols=>• def$js_id_symbols θoct||: 101;
def$js_id_symbols=>• _||;
def$js_id_symbols=>• $||;
def$js_id_symbols=>• θid||;
def$js_id_symbols=>• θkey||;
def$js_id_symbols=>• def$js_id_symbols θid|#: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|#: 101;
def$js_id_symbols=>• def$js_id_symbols _|#: 101;
def$js_id_symbols=>• def$js_id_symbols $|#: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|#: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|#: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|#: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|#: 101;
def$js_id_symbols=>• _|#;
def$js_id_symbols=>• $|#;
def$js_id_symbols=>• θid|#;
def$js_id_symbols=>• θkey|#;
def$js_id_symbols=>• def$js_id_symbols θid|<>: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|<>: 101;
def$js_id_symbols=>• def$js_id_symbols _|<>: 101;
def$js_id_symbols=>• def$js_id_symbols $|<>: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|<>: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|<>: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|<>: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|<>: 101;
def$js_id_symbols=>• _|<>;
def$js_id_symbols=>• $|<>;
def$js_id_symbols=>• θid|<>;
def$js_id_symbols=>• θkey|<>;
def$js_id_symbols=>• def$js_id_symbols θid|+>: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|+>: 101;
def$js_id_symbols=>• def$js_id_symbols _|+>: 101;
def$js_id_symbols=>• def$js_id_symbols $|+>: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|+>: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|+>: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|+>: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|+>: 101;
def$js_id_symbols=>• _|+>;
def$js_id_symbols=>• $|+>;
def$js_id_symbols=>• θid|+>;
def$js_id_symbols=>• θkey|+>;
def$js_id_symbols=>• def$js_id_symbols θid|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols _|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols $|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|END_OF_FILE: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|END_OF_FILE: 101;
def$js_id_symbols=>• _|END_OF_FILE;
def$js_id_symbols=>• $|END_OF_FILE;
def$js_id_symbols=>• θid|END_OF_FILE;
def$js_id_symbols=>• θkey|END_OF_FILE;
def$js_id_symbols=>• def$js_id_symbols θid|}: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|}: 101;
def$js_id_symbols=>• def$js_id_symbols _|}: 101;
def$js_id_symbols=>• def$js_id_symbols $|}: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|}: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|}: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|}: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|}: 101;
def$js_id_symbols=>• _|};
def$js_id_symbols=>• $|};
def$js_id_symbols=>• θid|};
def$js_id_symbols=>• θkey|};
def$js_id_symbols=>• def$js_id_symbols θid|ws: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|ws: 101;
def$js_id_symbols=>• def$js_id_symbols _|ws: 101;
def$js_id_symbols=>• def$js_id_symbols $|ws: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|ws: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|ws: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|ws: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|ws: 101;
def$js_id_symbols=>• _|ws;
def$js_id_symbols=>• $|ws;
def$js_id_symbols=>• θid|ws;
def$js_id_symbols=>• θkey|ws;
def$js_id_symbols=>• def$js_id_symbols θid|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols _|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols $|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|$eof: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|$eof: 101;
def$js_id_symbols=>• _|$eof;
def$js_id_symbols=>• $|$eof;
def$js_id_symbols=>• θid|$eof;
def$js_id_symbols=>• θkey|$eof;
def$js_id_symbols=>• def$js_id_symbols θid|→: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|→: 101;
def$js_id_symbols=>• def$js_id_symbols _|→: 101;
def$js_id_symbols=>• def$js_id_symbols $|→: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|→: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|→: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|→: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|→: 101;
def$js_id_symbols=>• _|→;
def$js_id_symbols=>• $|→;
def$js_id_symbols=>• θid|→;
def$js_id_symbols=>• θkey|→;
def$js_id_symbols=>• def$js_id_symbols θid|>: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|>: 101;
def$js_id_symbols=>• def$js_id_symbols _|>: 101;
def$js_id_symbols=>• def$js_id_symbols $|>: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|>: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|>: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|>: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|>: 101;
def$js_id_symbols=>• _|>;
def$js_id_symbols=>• $|>;
def$js_id_symbols=>• θid|>;
def$js_id_symbols=>• θkey|>;
def$js_id_symbols=>• def$js_id_symbols θid|::: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|::: 101;
def$js_id_symbols=>• def$js_id_symbols _|::: 101;
def$js_id_symbols=>• def$js_id_symbols $|::: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|::: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|::: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|::: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|::: 101;
def$js_id_symbols=>• _|::;
def$js_id_symbols=>• $|::;
def$js_id_symbols=>• θid|::;
def$js_id_symbols=>• θkey|::;
def$js_id_symbols=>• def$js_id_symbols θid|sci: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|sci: 101;
def$js_id_symbols=>• def$js_id_symbols _|sci: 101;
def$js_id_symbols=>• def$js_id_symbols $|sci: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|sci: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|sci: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|sci: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|sci: 101;
def$js_id_symbols=>• _|sci;
def$js_id_symbols=>• $|sci;
def$js_id_symbols=>• θid|sci;
def$js_id_symbols=>• θkey|sci;
def$js_id_symbols=>• def$js_id_symbols θid|flt: 101;
def$js_id_symbols=>• def$js_id_symbols θkey|flt: 101;
def$js_id_symbols=>• def$js_id_symbols _|flt: 101;
def$js_id_symbols=>• def$js_id_symbols $|flt: 101;
def$js_id_symbols=>• def$js_id_symbols θnum|flt: 101;
def$js_id_symbols=>• def$js_id_symbols θhex|flt: 101;
def$js_id_symbols=>• def$js_id_symbols θbin|flt: 101;
def$js_id_symbols=>• def$js_id_symbols θoct|flt: 101;
def$js_id_symbols=>• _|flt;
def$js_id_symbols=>• $|flt;
def$js_id_symbols=>• θid|flt;
def$js_id_symbols=>• θkey|flt
*/
if(idm261.has(l.id)){idm261.get(l.id)(l); } else if(tym261.has(l.ty)){tym261.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 101: //def$js_id_symbols
if(const_6_.includes(l.id)||l.ty == 0 /*--*//* EOF */||l.ty == 1/* \ws--- */||l.ty == 4/* \nl--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \flt--- */||l.ty == 6/* \sci--- */||l.ty == 6/* \sym--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State262(cp)
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
    function State262 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols • θid|id;
def$js_id_symbols=>def$js_id_symbols • θkey|id;
def$js_id_symbols=>def$js_id_symbols • _|id;
def$js_id_symbols=>def$js_id_symbols • $|id;
def$js_id_symbols=>def$js_id_symbols • θnum|id;
def$js_id_symbols=>def$js_id_symbols • θhex|id;
def$js_id_symbols=>def$js_id_symbols • θbin|id;
def$js_id_symbols=>def$js_id_symbols • θoct|id;
def$js_id_symbols=>def$js_id_symbols • θid|key;
def$js_id_symbols=>def$js_id_symbols • θkey|key;
def$js_id_symbols=>def$js_id_symbols • _|key;
def$js_id_symbols=>def$js_id_symbols • $|key;
def$js_id_symbols=>def$js_id_symbols • θnum|key;
def$js_id_symbols=>def$js_id_symbols • θhex|key;
def$js_id_symbols=>def$js_id_symbols • θbin|key;
def$js_id_symbols=>def$js_id_symbols • θoct|key;
def$js_id_symbols=>def$js_id_symbols • θid|_;
def$js_id_symbols=>def$js_id_symbols • θkey|_;
def$js_id_symbols=>def$js_id_symbols • _|_;
def$js_id_symbols=>def$js_id_symbols • $|_;
def$js_id_symbols=>def$js_id_symbols • θnum|_;
def$js_id_symbols=>def$js_id_symbols • θhex|_;
def$js_id_symbols=>def$js_id_symbols • θbin|_;
def$js_id_symbols=>def$js_id_symbols • θoct|_;
def$js_id_symbols=>def$js_id_symbols • θid|$;
def$js_id_symbols=>def$js_id_symbols • θkey|$;
def$js_id_symbols=>def$js_id_symbols • _|$;
def$js_id_symbols=>def$js_id_symbols • $|$;
def$js_id_symbols=>def$js_id_symbols • θnum|$;
def$js_id_symbols=>def$js_id_symbols • θhex|$;
def$js_id_symbols=>def$js_id_symbols • θbin|$;
def$js_id_symbols=>def$js_id_symbols • θoct|$;
def$js_id_symbols=>def$js_id_symbols • θid|num;
def$js_id_symbols=>def$js_id_symbols • θkey|num;
def$js_id_symbols=>def$js_id_symbols • _|num;
def$js_id_symbols=>def$js_id_symbols • $|num;
def$js_id_symbols=>def$js_id_symbols • θnum|num;
def$js_id_symbols=>def$js_id_symbols • θhex|num;
def$js_id_symbols=>def$js_id_symbols • θbin|num;
def$js_id_symbols=>def$js_id_symbols • θoct|num;
def$js_id_symbols=>def$js_id_symbols • θid|hex;
def$js_id_symbols=>def$js_id_symbols • θkey|hex;
def$js_id_symbols=>def$js_id_symbols • _|hex;
def$js_id_symbols=>def$js_id_symbols • $|hex;
def$js_id_symbols=>def$js_id_symbols • θnum|hex;
def$js_id_symbols=>def$js_id_symbols • θhex|hex;
def$js_id_symbols=>def$js_id_symbols • θbin|hex;
def$js_id_symbols=>def$js_id_symbols • θoct|hex;
def$js_id_symbols=>def$js_id_symbols • θid|bin;
def$js_id_symbols=>def$js_id_symbols • θkey|bin;
def$js_id_symbols=>def$js_id_symbols • _|bin;
def$js_id_symbols=>def$js_id_symbols • $|bin;
def$js_id_symbols=>def$js_id_symbols • θnum|bin;
def$js_id_symbols=>def$js_id_symbols • θhex|bin;
def$js_id_symbols=>def$js_id_symbols • θbin|bin;
def$js_id_symbols=>def$js_id_symbols • θoct|bin;
def$js_id_symbols=>def$js_id_symbols • θid|oct;
def$js_id_symbols=>def$js_id_symbols • θkey|oct;
def$js_id_symbols=>def$js_id_symbols • _|oct;
def$js_id_symbols=>def$js_id_symbols • $|oct;
def$js_id_symbols=>def$js_id_symbols • θnum|oct;
def$js_id_symbols=>def$js_id_symbols • θhex|oct;
def$js_id_symbols=>def$js_id_symbols • θbin|oct;
def$js_id_symbols=>def$js_id_symbols • θoct|oct;
def$js_id_symbols=>def$js_id_symbols • θid|nl;
def$js_id_symbols=>def$js_id_symbols • θkey|nl;
def$js_id_symbols=>def$js_id_symbols • _|nl;
def$js_id_symbols=>def$js_id_symbols • $|nl;
def$js_id_symbols=>def$js_id_symbols • θnum|nl;
def$js_id_symbols=>def$js_id_symbols • θhex|nl;
def$js_id_symbols=>def$js_id_symbols • θbin|nl;
def$js_id_symbols=>def$js_id_symbols • θoct|nl;
def$js_id_symbols=>def$js_id_symbols • θid|^;
def$js_id_symbols=>def$js_id_symbols • θkey|^;
def$js_id_symbols=>def$js_id_symbols • _|^;
def$js_id_symbols=>def$js_id_symbols • $|^;
def$js_id_symbols=>def$js_id_symbols • θnum|^;
def$js_id_symbols=>def$js_id_symbols • θhex|^;
def$js_id_symbols=>def$js_id_symbols • θbin|^;
def$js_id_symbols=>def$js_id_symbols • θoct|^;
def$js_id_symbols=>def$js_id_symbols • θid|{;
def$js_id_symbols=>def$js_id_symbols • θkey|{;
def$js_id_symbols=>def$js_id_symbols • _|{;
def$js_id_symbols=>def$js_id_symbols • $|{;
def$js_id_symbols=>def$js_id_symbols • θnum|{;
def$js_id_symbols=>def$js_id_symbols • θhex|{;
def$js_id_symbols=>def$js_id_symbols • θbin|{;
def$js_id_symbols=>def$js_id_symbols • θoct|{;
def$js_id_symbols=>def$js_id_symbols • θid|);
def$js_id_symbols=>def$js_id_symbols • θkey|);
def$js_id_symbols=>def$js_id_symbols • _|);
def$js_id_symbols=>def$js_id_symbols • $|);
def$js_id_symbols=>def$js_id_symbols • θnum|);
def$js_id_symbols=>def$js_id_symbols • θhex|);
def$js_id_symbols=>def$js_id_symbols • θbin|);
def$js_id_symbols=>def$js_id_symbols • θoct|);
def$js_id_symbols=>def$js_id_symbols • θid|θ;
def$js_id_symbols=>def$js_id_symbols • θkey|θ;
def$js_id_symbols=>def$js_id_symbols • _|θ;
def$js_id_symbols=>def$js_id_symbols • $|θ;
def$js_id_symbols=>def$js_id_symbols • θnum|θ;
def$js_id_symbols=>def$js_id_symbols • θhex|θ;
def$js_id_symbols=>def$js_id_symbols • θbin|θ;
def$js_id_symbols=>def$js_id_symbols • θoct|θ;
def$js_id_symbols=>def$js_id_symbols • θid|g;
def$js_id_symbols=>def$js_id_symbols • θkey|g;
def$js_id_symbols=>def$js_id_symbols • _|g;
def$js_id_symbols=>def$js_id_symbols • $|g;
def$js_id_symbols=>def$js_id_symbols • θnum|g;
def$js_id_symbols=>def$js_id_symbols • θhex|g;
def$js_id_symbols=>def$js_id_symbols • θbin|g;
def$js_id_symbols=>def$js_id_symbols • θoct|g;
def$js_id_symbols=>def$js_id_symbols • θid|τ;
def$js_id_symbols=>def$js_id_symbols • θkey|τ;
def$js_id_symbols=>def$js_id_symbols • _|τ;
def$js_id_symbols=>def$js_id_symbols • $|τ;
def$js_id_symbols=>def$js_id_symbols • θnum|τ;
def$js_id_symbols=>def$js_id_symbols • θhex|τ;
def$js_id_symbols=>def$js_id_symbols • θbin|τ;
def$js_id_symbols=>def$js_id_symbols • θoct|τ;
def$js_id_symbols=>def$js_id_symbols • θid|t;
def$js_id_symbols=>def$js_id_symbols • θkey|t;
def$js_id_symbols=>def$js_id_symbols • _|t;
def$js_id_symbols=>def$js_id_symbols • $|t;
def$js_id_symbols=>def$js_id_symbols • θnum|t;
def$js_id_symbols=>def$js_id_symbols • θhex|t;
def$js_id_symbols=>def$js_id_symbols • θbin|t;
def$js_id_symbols=>def$js_id_symbols • θoct|t;
def$js_id_symbols=>def$js_id_symbols • θid|\;
def$js_id_symbols=>def$js_id_symbols • θkey|\;
def$js_id_symbols=>def$js_id_symbols • _|\;
def$js_id_symbols=>def$js_id_symbols • $|\;
def$js_id_symbols=>def$js_id_symbols • θnum|\;
def$js_id_symbols=>def$js_id_symbols • θhex|\;
def$js_id_symbols=>def$js_id_symbols • θbin|\;
def$js_id_symbols=>def$js_id_symbols • θoct|\;
def$js_id_symbols=>def$js_id_symbols • θid|assert;
def$js_id_symbols=>def$js_id_symbols • θkey|assert;
def$js_id_symbols=>def$js_id_symbols • _|assert;
def$js_id_symbols=>def$js_id_symbols • $|assert;
def$js_id_symbols=>def$js_id_symbols • θnum|assert;
def$js_id_symbols=>def$js_id_symbols • θhex|assert;
def$js_id_symbols=>def$js_id_symbols • θbin|assert;
def$js_id_symbols=>def$js_id_symbols • θoct|assert;
def$js_id_symbols=>def$js_id_symbols • θid|shift;
def$js_id_symbols=>def$js_id_symbols • θkey|shift;
def$js_id_symbols=>def$js_id_symbols • _|shift;
def$js_id_symbols=>def$js_id_symbols • $|shift;
def$js_id_symbols=>def$js_id_symbols • θnum|shift;
def$js_id_symbols=>def$js_id_symbols • θhex|shift;
def$js_id_symbols=>def$js_id_symbols • θbin|shift;
def$js_id_symbols=>def$js_id_symbols • θoct|shift;
def$js_id_symbols=>def$js_id_symbols • θid|?;
def$js_id_symbols=>def$js_id_symbols • θkey|?;
def$js_id_symbols=>def$js_id_symbols • _|?;
def$js_id_symbols=>def$js_id_symbols • $|?;
def$js_id_symbols=>def$js_id_symbols • θnum|?;
def$js_id_symbols=>def$js_id_symbols • θhex|?;
def$js_id_symbols=>def$js_id_symbols • θbin|?;
def$js_id_symbols=>def$js_id_symbols • θoct|?;
def$js_id_symbols=>def$js_id_symbols • θid|(+;
def$js_id_symbols=>def$js_id_symbols • θkey|(+;
def$js_id_symbols=>def$js_id_symbols • _|(+;
def$js_id_symbols=>def$js_id_symbols • $|(+;
def$js_id_symbols=>def$js_id_symbols • θnum|(+;
def$js_id_symbols=>def$js_id_symbols • θhex|(+;
def$js_id_symbols=>def$js_id_symbols • θbin|(+;
def$js_id_symbols=>def$js_id_symbols • θoct|(+;
def$js_id_symbols=>def$js_id_symbols • θid|(*;
def$js_id_symbols=>def$js_id_symbols • θkey|(*;
def$js_id_symbols=>def$js_id_symbols • _|(*;
def$js_id_symbols=>def$js_id_symbols • $|(*;
def$js_id_symbols=>def$js_id_symbols • θnum|(*;
def$js_id_symbols=>def$js_id_symbols • θhex|(*;
def$js_id_symbols=>def$js_id_symbols • θbin|(*;
def$js_id_symbols=>def$js_id_symbols • θoct|(*;
def$js_id_symbols=>def$js_id_symbols • θid|↦;
def$js_id_symbols=>def$js_id_symbols • θkey|↦;
def$js_id_symbols=>def$js_id_symbols • _|↦;
def$js_id_symbols=>def$js_id_symbols • $|↦;
def$js_id_symbols=>def$js_id_symbols • θnum|↦;
def$js_id_symbols=>def$js_id_symbols • θhex|↦;
def$js_id_symbols=>def$js_id_symbols • θbin|↦;
def$js_id_symbols=>def$js_id_symbols • θoct|↦;
def$js_id_symbols=>def$js_id_symbols • θid|f;
def$js_id_symbols=>def$js_id_symbols • θkey|f;
def$js_id_symbols=>def$js_id_symbols • _|f;
def$js_id_symbols=>def$js_id_symbols • $|f;
def$js_id_symbols=>def$js_id_symbols • θnum|f;
def$js_id_symbols=>def$js_id_symbols • θhex|f;
def$js_id_symbols=>def$js_id_symbols • θbin|f;
def$js_id_symbols=>def$js_id_symbols • θoct|f;
def$js_id_symbols=>def$js_id_symbols • θid|(;
def$js_id_symbols=>def$js_id_symbols • θkey|(;
def$js_id_symbols=>def$js_id_symbols • _|(;
def$js_id_symbols=>def$js_id_symbols • $|(;
def$js_id_symbols=>def$js_id_symbols • θnum|(;
def$js_id_symbols=>def$js_id_symbols • θhex|(;
def$js_id_symbols=>def$js_id_symbols • θbin|(;
def$js_id_symbols=>def$js_id_symbols • θoct|(;
def$js_id_symbols=>def$js_id_symbols • θid|sym;
def$js_id_symbols=>def$js_id_symbols • θkey|sym;
def$js_id_symbols=>def$js_id_symbols • _|sym;
def$js_id_symbols=>def$js_id_symbols • $|sym;
def$js_id_symbols=>def$js_id_symbols • θnum|sym;
def$js_id_symbols=>def$js_id_symbols • θhex|sym;
def$js_id_symbols=>def$js_id_symbols • θbin|sym;
def$js_id_symbols=>def$js_id_symbols • θoct|sym;
def$js_id_symbols=>def$js_id_symbols • θid|tok;
def$js_id_symbols=>def$js_id_symbols • θkey|tok;
def$js_id_symbols=>def$js_id_symbols • _|tok;
def$js_id_symbols=>def$js_id_symbols • $|tok;
def$js_id_symbols=>def$js_id_symbols • θnum|tok;
def$js_id_symbols=>def$js_id_symbols • θhex|tok;
def$js_id_symbols=>def$js_id_symbols • θbin|tok;
def$js_id_symbols=>def$js_id_symbols • θoct|tok;
def$js_id_symbols=>def$js_id_symbols • θid|];
def$js_id_symbols=>def$js_id_symbols • θkey|];
def$js_id_symbols=>def$js_id_symbols • _|];
def$js_id_symbols=>def$js_id_symbols • $|];
def$js_id_symbols=>def$js_id_symbols • θnum|];
def$js_id_symbols=>def$js_id_symbols • θhex|];
def$js_id_symbols=>def$js_id_symbols • θbin|];
def$js_id_symbols=>def$js_id_symbols • θoct|];
def$js_id_symbols=>def$js_id_symbols • θid|│;
def$js_id_symbols=>def$js_id_symbols • θkey|│;
def$js_id_symbols=>def$js_id_symbols • _|│;
def$js_id_symbols=>def$js_id_symbols • $|│;
def$js_id_symbols=>def$js_id_symbols • θnum|│;
def$js_id_symbols=>def$js_id_symbols • θhex|│;
def$js_id_symbols=>def$js_id_symbols • θbin|│;
def$js_id_symbols=>def$js_id_symbols • θoct|│;
def$js_id_symbols=>def$js_id_symbols • θid||;
def$js_id_symbols=>def$js_id_symbols • θkey||;
def$js_id_symbols=>def$js_id_symbols • _||;
def$js_id_symbols=>def$js_id_symbols • $||;
def$js_id_symbols=>def$js_id_symbols • θnum||;
def$js_id_symbols=>def$js_id_symbols • θhex||;
def$js_id_symbols=>def$js_id_symbols • θbin||;
def$js_id_symbols=>def$js_id_symbols • θoct||;
def$js_id_symbols=>def$js_id_symbols • θid|#;
def$js_id_symbols=>def$js_id_symbols • θkey|#;
def$js_id_symbols=>def$js_id_symbols • _|#;
def$js_id_symbols=>def$js_id_symbols • $|#;
def$js_id_symbols=>def$js_id_symbols • θnum|#;
def$js_id_symbols=>def$js_id_symbols • θhex|#;
def$js_id_symbols=>def$js_id_symbols • θbin|#;
def$js_id_symbols=>def$js_id_symbols • θoct|#;
def$js_id_symbols=>def$js_id_symbols • θid|<>;
def$js_id_symbols=>def$js_id_symbols • θkey|<>;
def$js_id_symbols=>def$js_id_symbols • _|<>;
def$js_id_symbols=>def$js_id_symbols • $|<>;
def$js_id_symbols=>def$js_id_symbols • θnum|<>;
def$js_id_symbols=>def$js_id_symbols • θhex|<>;
def$js_id_symbols=>def$js_id_symbols • θbin|<>;
def$js_id_symbols=>def$js_id_symbols • θoct|<>;
def$js_id_symbols=>def$js_id_symbols • θid|+>;
def$js_id_symbols=>def$js_id_symbols • θkey|+>;
def$js_id_symbols=>def$js_id_symbols • _|+>;
def$js_id_symbols=>def$js_id_symbols • $|+>;
def$js_id_symbols=>def$js_id_symbols • θnum|+>;
def$js_id_symbols=>def$js_id_symbols • θhex|+>;
def$js_id_symbols=>def$js_id_symbols • θbin|+>;
def$js_id_symbols=>def$js_id_symbols • θoct|+>;
def$js_id_symbols=>def$js_id_symbols • θid|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θkey|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • _|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • $|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θnum|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θhex|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θbin|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θoct|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols • θid|};
def$js_id_symbols=>def$js_id_symbols • θkey|};
def$js_id_symbols=>def$js_id_symbols • _|};
def$js_id_symbols=>def$js_id_symbols • $|};
def$js_id_symbols=>def$js_id_symbols • θnum|};
def$js_id_symbols=>def$js_id_symbols • θhex|};
def$js_id_symbols=>def$js_id_symbols • θbin|};
def$js_id_symbols=>def$js_id_symbols • θoct|};
def$js_id_symbols=>def$js_id_symbols • θid|ws;
def$js_id_symbols=>def$js_id_symbols • θkey|ws;
def$js_id_symbols=>def$js_id_symbols • _|ws;
def$js_id_symbols=>def$js_id_symbols • $|ws;
def$js_id_symbols=>def$js_id_symbols • θnum|ws;
def$js_id_symbols=>def$js_id_symbols • θhex|ws;
def$js_id_symbols=>def$js_id_symbols • θbin|ws;
def$js_id_symbols=>def$js_id_symbols • θoct|ws;
def$js_id_symbols=>def$js_id_symbols • θid|$eof;
def$js_id_symbols=>def$js_id_symbols • θkey|$eof;
def$js_id_symbols=>def$js_id_symbols • _|$eof;
def$js_id_symbols=>def$js_id_symbols • $|$eof;
def$js_id_symbols=>def$js_id_symbols • θnum|$eof;
def$js_id_symbols=>def$js_id_symbols • θhex|$eof;
def$js_id_symbols=>def$js_id_symbols • θbin|$eof;
def$js_id_symbols=>def$js_id_symbols • θoct|$eof;
def$js_id_symbols=>def$js_id_symbols • θid|→;
def$js_id_symbols=>def$js_id_symbols • θkey|→;
def$js_id_symbols=>def$js_id_symbols • _|→;
def$js_id_symbols=>def$js_id_symbols • $|→;
def$js_id_symbols=>def$js_id_symbols • θnum|→;
def$js_id_symbols=>def$js_id_symbols • θhex|→;
def$js_id_symbols=>def$js_id_symbols • θbin|→;
def$js_id_symbols=>def$js_id_symbols • θoct|→;
def$js_id_symbols=>def$js_id_symbols • θid|>;
def$js_id_symbols=>def$js_id_symbols • θkey|>;
def$js_id_symbols=>def$js_id_symbols • _|>;
def$js_id_symbols=>def$js_id_symbols • $|>;
def$js_id_symbols=>def$js_id_symbols • θnum|>;
def$js_id_symbols=>def$js_id_symbols • θhex|>;
def$js_id_symbols=>def$js_id_symbols • θbin|>;
def$js_id_symbols=>def$js_id_symbols • θoct|>;
def$js_id_symbols=>def$js_id_symbols • θid|::;
def$js_id_symbols=>def$js_id_symbols • θkey|::;
def$js_id_symbols=>def$js_id_symbols • _|::;
def$js_id_symbols=>def$js_id_symbols • $|::;
def$js_id_symbols=>def$js_id_symbols • θnum|::;
def$js_id_symbols=>def$js_id_symbols • θhex|::;
def$js_id_symbols=>def$js_id_symbols • θbin|::;
def$js_id_symbols=>def$js_id_symbols • θoct|::;
def$js_id_symbols=>def$js_id_symbols • θid|sci;
def$js_id_symbols=>def$js_id_symbols • θkey|sci;
def$js_id_symbols=>def$js_id_symbols • _|sci;
def$js_id_symbols=>def$js_id_symbols • $|sci;
def$js_id_symbols=>def$js_id_symbols • θnum|sci;
def$js_id_symbols=>def$js_id_symbols • θhex|sci;
def$js_id_symbols=>def$js_id_symbols • θbin|sci;
def$js_id_symbols=>def$js_id_symbols • θoct|sci;
def$js_id_symbols=>def$js_id_symbols • θid|flt;
def$js_id_symbols=>def$js_id_symbols • θkey|flt;
def$js_id_symbols=>def$js_id_symbols • _|flt;
def$js_id_symbols=>def$js_id_symbols • $|flt;
def$js_id_symbols=>def$js_id_symbols • θnum|flt;
def$js_id_symbols=>def$js_id_symbols • θhex|flt;
def$js_id_symbols=>def$js_id_symbols • θbin|flt;
def$js_id_symbols=>def$js_id_symbols • θoct|flt
*/
if(idm262.has(l.id)){idm262.get(l.id)(l); } else if(tym262.has(l.ty)){tym262.get(l.ty)(l); }
else fail(l);
}
    function State266 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θid •|id;
def$js_id_symbols=>def$js_id_symbols θid •|key;
def$js_id_symbols=>def$js_id_symbols θid •|_;
def$js_id_symbols=>def$js_id_symbols θid •|$;
def$js_id_symbols=>def$js_id_symbols θid •|num;
def$js_id_symbols=>def$js_id_symbols θid •|hex;
def$js_id_symbols=>def$js_id_symbols θid •|bin;
def$js_id_symbols=>def$js_id_symbols θid •|oct;
def$js_id_symbols=>def$js_id_symbols θid •|sci;
def$js_id_symbols=>def$js_id_symbols θid •|flt;
def$js_id_symbols=>def$js_id_symbols θid •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θid •|→;
def$js_id_symbols=>def$js_id_symbols θid •|>;
def$js_id_symbols=>def$js_id_symbols θid •|::;
def$js_id_symbols=>def$js_id_symbols θid •|^;
def$js_id_symbols=>def$js_id_symbols θid •|{;
def$js_id_symbols=>def$js_id_symbols θid •|θ;
def$js_id_symbols=>def$js_id_symbols θid •|g;
def$js_id_symbols=>def$js_id_symbols θid •|τ;
def$js_id_symbols=>def$js_id_symbols θid •|t;
def$js_id_symbols=>def$js_id_symbols θid •|\;
def$js_id_symbols=>def$js_id_symbols θid •|sym;
def$js_id_symbols=>def$js_id_symbols θid •|tok;
def$js_id_symbols=>def$js_id_symbols θid •|nl;
def$js_id_symbols=>def$js_id_symbols θid •|ws;
def$js_id_symbols=>def$js_id_symbols θid •|$eof;
def$js_id_symbols=>def$js_id_symbols θid •|assert;
def$js_id_symbols=>def$js_id_symbols θid •|shift;
def$js_id_symbols=>def$js_id_symbols θid •|);
def$js_id_symbols=>def$js_id_symbols θid •|?;
def$js_id_symbols=>def$js_id_symbols θid •|(+;
def$js_id_symbols=>def$js_id_symbols θid •|(*;
def$js_id_symbols=>def$js_id_symbols θid •|(;
def$js_id_symbols=>def$js_id_symbols θid •|↦;
def$js_id_symbols=>def$js_id_symbols θid •|f;
def$js_id_symbols=>def$js_id_symbols θid •|│;
def$js_id_symbols=>def$js_id_symbols θid •||;
def$js_id_symbols=>def$js_id_symbols θid •|#;
def$js_id_symbols=>def$js_id_symbols θid •|<>;
def$js_id_symbols=>def$js_id_symbols θid •|+>;
def$js_id_symbols=>def$js_id_symbols θid •|};
def$js_id_symbols=>def$js_id_symbols θid •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State267 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θkey •|id;
def$js_id_symbols=>def$js_id_symbols θkey •|key;
def$js_id_symbols=>def$js_id_symbols θkey •|_;
def$js_id_symbols=>def$js_id_symbols θkey •|$;
def$js_id_symbols=>def$js_id_symbols θkey •|num;
def$js_id_symbols=>def$js_id_symbols θkey •|hex;
def$js_id_symbols=>def$js_id_symbols θkey •|bin;
def$js_id_symbols=>def$js_id_symbols θkey •|oct;
def$js_id_symbols=>def$js_id_symbols θkey •|sci;
def$js_id_symbols=>def$js_id_symbols θkey •|flt;
def$js_id_symbols=>def$js_id_symbols θkey •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θkey •|→;
def$js_id_symbols=>def$js_id_symbols θkey •|>;
def$js_id_symbols=>def$js_id_symbols θkey •|::;
def$js_id_symbols=>def$js_id_symbols θkey •|^;
def$js_id_symbols=>def$js_id_symbols θkey •|{;
def$js_id_symbols=>def$js_id_symbols θkey •|θ;
def$js_id_symbols=>def$js_id_symbols θkey •|g;
def$js_id_symbols=>def$js_id_symbols θkey •|τ;
def$js_id_symbols=>def$js_id_symbols θkey •|t;
def$js_id_symbols=>def$js_id_symbols θkey •|\;
def$js_id_symbols=>def$js_id_symbols θkey •|sym;
def$js_id_symbols=>def$js_id_symbols θkey •|tok;
def$js_id_symbols=>def$js_id_symbols θkey •|nl;
def$js_id_symbols=>def$js_id_symbols θkey •|ws;
def$js_id_symbols=>def$js_id_symbols θkey •|$eof;
def$js_id_symbols=>def$js_id_symbols θkey •|assert;
def$js_id_symbols=>def$js_id_symbols θkey •|shift;
def$js_id_symbols=>def$js_id_symbols θkey •|);
def$js_id_symbols=>def$js_id_symbols θkey •|?;
def$js_id_symbols=>def$js_id_symbols θkey •|(+;
def$js_id_symbols=>def$js_id_symbols θkey •|(*;
def$js_id_symbols=>def$js_id_symbols θkey •|(;
def$js_id_symbols=>def$js_id_symbols θkey •|↦;
def$js_id_symbols=>def$js_id_symbols θkey •|f;
def$js_id_symbols=>def$js_id_symbols θkey •|│;
def$js_id_symbols=>def$js_id_symbols θkey •||;
def$js_id_symbols=>def$js_id_symbols θkey •|#;
def$js_id_symbols=>def$js_id_symbols θkey •|<>;
def$js_id_symbols=>def$js_id_symbols θkey •|+>;
def$js_id_symbols=>def$js_id_symbols θkey •|};
def$js_id_symbols=>def$js_id_symbols θkey •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State268 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols _ •|id;
def$js_id_symbols=>def$js_id_symbols _ •|key;
def$js_id_symbols=>def$js_id_symbols _ •|_;
def$js_id_symbols=>def$js_id_symbols _ •|$;
def$js_id_symbols=>def$js_id_symbols _ •|num;
def$js_id_symbols=>def$js_id_symbols _ •|hex;
def$js_id_symbols=>def$js_id_symbols _ •|bin;
def$js_id_symbols=>def$js_id_symbols _ •|oct;
def$js_id_symbols=>def$js_id_symbols _ •|sci;
def$js_id_symbols=>def$js_id_symbols _ •|flt;
def$js_id_symbols=>def$js_id_symbols _ •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols _ •|→;
def$js_id_symbols=>def$js_id_symbols _ •|>;
def$js_id_symbols=>def$js_id_symbols _ •|::;
def$js_id_symbols=>def$js_id_symbols _ •|^;
def$js_id_symbols=>def$js_id_symbols _ •|{;
def$js_id_symbols=>def$js_id_symbols _ •|θ;
def$js_id_symbols=>def$js_id_symbols _ •|g;
def$js_id_symbols=>def$js_id_symbols _ •|τ;
def$js_id_symbols=>def$js_id_symbols _ •|t;
def$js_id_symbols=>def$js_id_symbols _ •|\;
def$js_id_symbols=>def$js_id_symbols _ •|sym;
def$js_id_symbols=>def$js_id_symbols _ •|tok;
def$js_id_symbols=>def$js_id_symbols _ •|nl;
def$js_id_symbols=>def$js_id_symbols _ •|ws;
def$js_id_symbols=>def$js_id_symbols _ •|$eof;
def$js_id_symbols=>def$js_id_symbols _ •|assert;
def$js_id_symbols=>def$js_id_symbols _ •|shift;
def$js_id_symbols=>def$js_id_symbols _ •|);
def$js_id_symbols=>def$js_id_symbols _ •|?;
def$js_id_symbols=>def$js_id_symbols _ •|(+;
def$js_id_symbols=>def$js_id_symbols _ •|(*;
def$js_id_symbols=>def$js_id_symbols _ •|(;
def$js_id_symbols=>def$js_id_symbols _ •|↦;
def$js_id_symbols=>def$js_id_symbols _ •|f;
def$js_id_symbols=>def$js_id_symbols _ •|│;
def$js_id_symbols=>def$js_id_symbols _ •||;
def$js_id_symbols=>def$js_id_symbols _ •|#;
def$js_id_symbols=>def$js_id_symbols _ •|<>;
def$js_id_symbols=>def$js_id_symbols _ •|+>;
def$js_id_symbols=>def$js_id_symbols _ •|};
def$js_id_symbols=>def$js_id_symbols _ •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State269 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols $ •|id;
def$js_id_symbols=>def$js_id_symbols $ •|key;
def$js_id_symbols=>def$js_id_symbols $ •|_;
def$js_id_symbols=>def$js_id_symbols $ •|$;
def$js_id_symbols=>def$js_id_symbols $ •|num;
def$js_id_symbols=>def$js_id_symbols $ •|hex;
def$js_id_symbols=>def$js_id_symbols $ •|bin;
def$js_id_symbols=>def$js_id_symbols $ •|oct;
def$js_id_symbols=>def$js_id_symbols $ •|sci;
def$js_id_symbols=>def$js_id_symbols $ •|flt;
def$js_id_symbols=>def$js_id_symbols $ •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols $ •|→;
def$js_id_symbols=>def$js_id_symbols $ •|>;
def$js_id_symbols=>def$js_id_symbols $ •|::;
def$js_id_symbols=>def$js_id_symbols $ •|^;
def$js_id_symbols=>def$js_id_symbols $ •|{;
def$js_id_symbols=>def$js_id_symbols $ •|θ;
def$js_id_symbols=>def$js_id_symbols $ •|g;
def$js_id_symbols=>def$js_id_symbols $ •|τ;
def$js_id_symbols=>def$js_id_symbols $ •|t;
def$js_id_symbols=>def$js_id_symbols $ •|\;
def$js_id_symbols=>def$js_id_symbols $ •|sym;
def$js_id_symbols=>def$js_id_symbols $ •|tok;
def$js_id_symbols=>def$js_id_symbols $ •|nl;
def$js_id_symbols=>def$js_id_symbols $ •|ws;
def$js_id_symbols=>def$js_id_symbols $ •|$eof;
def$js_id_symbols=>def$js_id_symbols $ •|assert;
def$js_id_symbols=>def$js_id_symbols $ •|shift;
def$js_id_symbols=>def$js_id_symbols $ •|);
def$js_id_symbols=>def$js_id_symbols $ •|?;
def$js_id_symbols=>def$js_id_symbols $ •|(+;
def$js_id_symbols=>def$js_id_symbols $ •|(*;
def$js_id_symbols=>def$js_id_symbols $ •|(;
def$js_id_symbols=>def$js_id_symbols $ •|↦;
def$js_id_symbols=>def$js_id_symbols $ •|f;
def$js_id_symbols=>def$js_id_symbols $ •|│;
def$js_id_symbols=>def$js_id_symbols $ •||;
def$js_id_symbols=>def$js_id_symbols $ •|#;
def$js_id_symbols=>def$js_id_symbols $ •|<>;
def$js_id_symbols=>def$js_id_symbols $ •|+>;
def$js_id_symbols=>def$js_id_symbols $ •|};
def$js_id_symbols=>def$js_id_symbols $ •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State270 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θnum •|id;
def$js_id_symbols=>def$js_id_symbols θnum •|key;
def$js_id_symbols=>def$js_id_symbols θnum •|_;
def$js_id_symbols=>def$js_id_symbols θnum •|$;
def$js_id_symbols=>def$js_id_symbols θnum •|num;
def$js_id_symbols=>def$js_id_symbols θnum •|hex;
def$js_id_symbols=>def$js_id_symbols θnum •|bin;
def$js_id_symbols=>def$js_id_symbols θnum •|oct;
def$js_id_symbols=>def$js_id_symbols θnum •|sci;
def$js_id_symbols=>def$js_id_symbols θnum •|flt;
def$js_id_symbols=>def$js_id_symbols θnum •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θnum •|→;
def$js_id_symbols=>def$js_id_symbols θnum •|>;
def$js_id_symbols=>def$js_id_symbols θnum •|::;
def$js_id_symbols=>def$js_id_symbols θnum •|^;
def$js_id_symbols=>def$js_id_symbols θnum •|{;
def$js_id_symbols=>def$js_id_symbols θnum •|θ;
def$js_id_symbols=>def$js_id_symbols θnum •|g;
def$js_id_symbols=>def$js_id_symbols θnum •|τ;
def$js_id_symbols=>def$js_id_symbols θnum •|t;
def$js_id_symbols=>def$js_id_symbols θnum •|\;
def$js_id_symbols=>def$js_id_symbols θnum •|sym;
def$js_id_symbols=>def$js_id_symbols θnum •|tok;
def$js_id_symbols=>def$js_id_symbols θnum •|nl;
def$js_id_symbols=>def$js_id_symbols θnum •|ws;
def$js_id_symbols=>def$js_id_symbols θnum •|$eof;
def$js_id_symbols=>def$js_id_symbols θnum •|assert;
def$js_id_symbols=>def$js_id_symbols θnum •|shift;
def$js_id_symbols=>def$js_id_symbols θnum •|);
def$js_id_symbols=>def$js_id_symbols θnum •|?;
def$js_id_symbols=>def$js_id_symbols θnum •|(+;
def$js_id_symbols=>def$js_id_symbols θnum •|(*;
def$js_id_symbols=>def$js_id_symbols θnum •|(;
def$js_id_symbols=>def$js_id_symbols θnum •|↦;
def$js_id_symbols=>def$js_id_symbols θnum •|f;
def$js_id_symbols=>def$js_id_symbols θnum •|│;
def$js_id_symbols=>def$js_id_symbols θnum •||;
def$js_id_symbols=>def$js_id_symbols θnum •|#;
def$js_id_symbols=>def$js_id_symbols θnum •|<>;
def$js_id_symbols=>def$js_id_symbols θnum •|+>;
def$js_id_symbols=>def$js_id_symbols θnum •|};
def$js_id_symbols=>def$js_id_symbols θnum •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State271 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θhex •|id;
def$js_id_symbols=>def$js_id_symbols θhex •|key;
def$js_id_symbols=>def$js_id_symbols θhex •|_;
def$js_id_symbols=>def$js_id_symbols θhex •|$;
def$js_id_symbols=>def$js_id_symbols θhex •|num;
def$js_id_symbols=>def$js_id_symbols θhex •|hex;
def$js_id_symbols=>def$js_id_symbols θhex •|bin;
def$js_id_symbols=>def$js_id_symbols θhex •|oct;
def$js_id_symbols=>def$js_id_symbols θhex •|sci;
def$js_id_symbols=>def$js_id_symbols θhex •|flt;
def$js_id_symbols=>def$js_id_symbols θhex •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θhex •|→;
def$js_id_symbols=>def$js_id_symbols θhex •|>;
def$js_id_symbols=>def$js_id_symbols θhex •|::;
def$js_id_symbols=>def$js_id_symbols θhex •|^;
def$js_id_symbols=>def$js_id_symbols θhex •|{;
def$js_id_symbols=>def$js_id_symbols θhex •|θ;
def$js_id_symbols=>def$js_id_symbols θhex •|g;
def$js_id_symbols=>def$js_id_symbols θhex •|τ;
def$js_id_symbols=>def$js_id_symbols θhex •|t;
def$js_id_symbols=>def$js_id_symbols θhex •|\;
def$js_id_symbols=>def$js_id_symbols θhex •|sym;
def$js_id_symbols=>def$js_id_symbols θhex •|tok;
def$js_id_symbols=>def$js_id_symbols θhex •|nl;
def$js_id_symbols=>def$js_id_symbols θhex •|ws;
def$js_id_symbols=>def$js_id_symbols θhex •|$eof;
def$js_id_symbols=>def$js_id_symbols θhex •|assert;
def$js_id_symbols=>def$js_id_symbols θhex •|shift;
def$js_id_symbols=>def$js_id_symbols θhex •|);
def$js_id_symbols=>def$js_id_symbols θhex •|?;
def$js_id_symbols=>def$js_id_symbols θhex •|(+;
def$js_id_symbols=>def$js_id_symbols θhex •|(*;
def$js_id_symbols=>def$js_id_symbols θhex •|(;
def$js_id_symbols=>def$js_id_symbols θhex •|↦;
def$js_id_symbols=>def$js_id_symbols θhex •|f;
def$js_id_symbols=>def$js_id_symbols θhex •|│;
def$js_id_symbols=>def$js_id_symbols θhex •||;
def$js_id_symbols=>def$js_id_symbols θhex •|#;
def$js_id_symbols=>def$js_id_symbols θhex •|<>;
def$js_id_symbols=>def$js_id_symbols θhex •|+>;
def$js_id_symbols=>def$js_id_symbols θhex •|};
def$js_id_symbols=>def$js_id_symbols θhex •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State272 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θbin •|id;
def$js_id_symbols=>def$js_id_symbols θbin •|key;
def$js_id_symbols=>def$js_id_symbols θbin •|_;
def$js_id_symbols=>def$js_id_symbols θbin •|$;
def$js_id_symbols=>def$js_id_symbols θbin •|num;
def$js_id_symbols=>def$js_id_symbols θbin •|hex;
def$js_id_symbols=>def$js_id_symbols θbin •|bin;
def$js_id_symbols=>def$js_id_symbols θbin •|oct;
def$js_id_symbols=>def$js_id_symbols θbin •|sci;
def$js_id_symbols=>def$js_id_symbols θbin •|flt;
def$js_id_symbols=>def$js_id_symbols θbin •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θbin •|→;
def$js_id_symbols=>def$js_id_symbols θbin •|>;
def$js_id_symbols=>def$js_id_symbols θbin •|::;
def$js_id_symbols=>def$js_id_symbols θbin •|^;
def$js_id_symbols=>def$js_id_symbols θbin •|{;
def$js_id_symbols=>def$js_id_symbols θbin •|θ;
def$js_id_symbols=>def$js_id_symbols θbin •|g;
def$js_id_symbols=>def$js_id_symbols θbin •|τ;
def$js_id_symbols=>def$js_id_symbols θbin •|t;
def$js_id_symbols=>def$js_id_symbols θbin •|\;
def$js_id_symbols=>def$js_id_symbols θbin •|sym;
def$js_id_symbols=>def$js_id_symbols θbin •|tok;
def$js_id_symbols=>def$js_id_symbols θbin •|nl;
def$js_id_symbols=>def$js_id_symbols θbin •|ws;
def$js_id_symbols=>def$js_id_symbols θbin •|$eof;
def$js_id_symbols=>def$js_id_symbols θbin •|assert;
def$js_id_symbols=>def$js_id_symbols θbin •|shift;
def$js_id_symbols=>def$js_id_symbols θbin •|);
def$js_id_symbols=>def$js_id_symbols θbin •|?;
def$js_id_symbols=>def$js_id_symbols θbin •|(+;
def$js_id_symbols=>def$js_id_symbols θbin •|(*;
def$js_id_symbols=>def$js_id_symbols θbin •|(;
def$js_id_symbols=>def$js_id_symbols θbin •|↦;
def$js_id_symbols=>def$js_id_symbols θbin •|f;
def$js_id_symbols=>def$js_id_symbols θbin •|│;
def$js_id_symbols=>def$js_id_symbols θbin •||;
def$js_id_symbols=>def$js_id_symbols θbin •|#;
def$js_id_symbols=>def$js_id_symbols θbin •|<>;
def$js_id_symbols=>def$js_id_symbols θbin •|+>;
def$js_id_symbols=>def$js_id_symbols θbin •|};
def$js_id_symbols=>def$js_id_symbols θbin •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function State273 (l: Lexer): void{
                /*
def$js_id_symbols=>def$js_id_symbols θoct •|id;
def$js_id_symbols=>def$js_id_symbols θoct •|key;
def$js_id_symbols=>def$js_id_symbols θoct •|_;
def$js_id_symbols=>def$js_id_symbols θoct •|$;
def$js_id_symbols=>def$js_id_symbols θoct •|num;
def$js_id_symbols=>def$js_id_symbols θoct •|hex;
def$js_id_symbols=>def$js_id_symbols θoct •|bin;
def$js_id_symbols=>def$js_id_symbols θoct •|oct;
def$js_id_symbols=>def$js_id_symbols θoct •|sci;
def$js_id_symbols=>def$js_id_symbols θoct •|flt;
def$js_id_symbols=>def$js_id_symbols θoct •|END_OF_FILE;
def$js_id_symbols=>def$js_id_symbols θoct •|→;
def$js_id_symbols=>def$js_id_symbols θoct •|>;
def$js_id_symbols=>def$js_id_symbols θoct •|::;
def$js_id_symbols=>def$js_id_symbols θoct •|^;
def$js_id_symbols=>def$js_id_symbols θoct •|{;
def$js_id_symbols=>def$js_id_symbols θoct •|θ;
def$js_id_symbols=>def$js_id_symbols θoct •|g;
def$js_id_symbols=>def$js_id_symbols θoct •|τ;
def$js_id_symbols=>def$js_id_symbols θoct •|t;
def$js_id_symbols=>def$js_id_symbols θoct •|\;
def$js_id_symbols=>def$js_id_symbols θoct •|sym;
def$js_id_symbols=>def$js_id_symbols θoct •|tok;
def$js_id_symbols=>def$js_id_symbols θoct •|nl;
def$js_id_symbols=>def$js_id_symbols θoct •|ws;
def$js_id_symbols=>def$js_id_symbols θoct •|$eof;
def$js_id_symbols=>def$js_id_symbols θoct •|assert;
def$js_id_symbols=>def$js_id_symbols θoct •|shift;
def$js_id_symbols=>def$js_id_symbols θoct •|);
def$js_id_symbols=>def$js_id_symbols θoct •|?;
def$js_id_symbols=>def$js_id_symbols θoct •|(+;
def$js_id_symbols=>def$js_id_symbols θoct •|(*;
def$js_id_symbols=>def$js_id_symbols θoct •|(;
def$js_id_symbols=>def$js_id_symbols θoct •|↦;
def$js_id_symbols=>def$js_id_symbols θoct •|f;
def$js_id_symbols=>def$js_id_symbols θoct •|│;
def$js_id_symbols=>def$js_id_symbols θoct •||;
def$js_id_symbols=>def$js_id_symbols θoct •|#;
def$js_id_symbols=>def$js_id_symbols θoct •|<>;
def$js_id_symbols=>def$js_id_symbols θoct •|+>;
def$js_id_symbols=>def$js_id_symbols θoct •|};
def$js_id_symbols=>def$js_id_symbols θoct •|]
*/
if(idm266r.has(l.id)){idm266r.get(l.id)(l); return;} else if(tym266r.has(l.ty)){tym266r.get(l.ty)(l); return;}
else fail(l);
}
    function $prd$production (l: Lexer): void{
                /*
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|<>;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|<>;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|<>;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|+>;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|+>;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|+>;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|+>;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|#;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|#;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|#;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|#;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|↦;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|↦;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|↦;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|↦;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|f;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|f;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|f;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|f;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|END_OF_FILE;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|END_OF_FILE;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|END_OF_FILE;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|END_OF_FILE
*/
_skip(l, const__)
if(idm286.has(l.id)){idm286.get(l.id)(l); }
else fail(l);
}
    function State295 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|<>: 24;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|+>: 24;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|#: 24;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|↦: 24;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|f: 24;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(idm295.has(l.id)){idm295.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_bodies(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28: //pb$production_bodies
State344(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State299 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|<>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|<>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|+>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|+>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|#: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|#: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|↦: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|↦: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|f: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|f: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|END_OF_FILE: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(idm295.has(l.id)){idm295.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_bodies(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28: //pb$production_bodies
State362(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State300 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|<>: 24;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|+>: 24;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|#: 24;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|↦: 24;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|f: 24;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|END_OF_FILE: 24
*/
_skip(l, const__)
if(idm295.has(l.id)){idm295.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_bodies(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 28: //pb$production_bodies
State356(l)
 break;
case 24/*prd$production*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State307 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|): 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|<>: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|+>: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|↦: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|f: 28;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm307.has(l.id)){idm307.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_body(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29: //pb$production_body
State368(l)
 break;
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State308 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies cm$comment •|│;
pb$production_bodies=>pb$production_bodies cm$comment •||;
pb$production_bodies=>pb$production_bodies cm$comment •|#;
pb$production_bodies=>pb$production_bodies cm$comment •|);
pb$production_bodies=>pb$production_bodies cm$comment •|<>;
pb$production_bodies=>pb$production_bodies cm$comment •|+>;
pb$production_bodies=>pb$production_bodies cm$comment •|↦;
pb$production_bodies=>pb$production_bodies cm$comment •|f;
pb$production_bodies=>pb$production_bodies cm$comment •|END_OF_FILE
*/
_skip(l, const__)
if(idm308r.has(l.id)){idm308r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(27,2,28); stack_ptr-=2;
             
            ;return}
else fail(l);
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
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|): 63;
sym$symbol=>• θsym|);
sym$symbol=>• θtok|);
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|): 63;
sym$symbol=>• sym$generated_symbol|?: 63;
sym$symbol=>• sym$production_symbol|?: 63;
sym$symbol=>• sym$imported_production_symbol|?: 63;
sym$symbol=>• sym$literal_symbol|?: 63;
sym$symbol=>• sym$escaped_symbol|?: 63;
sym$symbol=>• sym$assert_function_symbol|?: 63;
sym$symbol=>• ( pb$production_bodies )|?;
sym$symbol=>• sym$symbol ?|?: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|?: 63;
sym$symbol=>• θsym|?;
sym$symbol=>• θtok|?;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|?: 63;
sym$symbol=>• sym$generated_symbol|(+: 63;
sym$symbol=>• sym$production_symbol|(+: 63;
sym$symbol=>• sym$imported_production_symbol|(+: 63;
sym$symbol=>• sym$literal_symbol|(+: 63;
sym$symbol=>• sym$escaped_symbol|(+: 63;
sym$symbol=>• sym$assert_function_symbol|(+: 63;
sym$symbol=>• ( pb$production_bodies )|(+;
sym$symbol=>• sym$symbol ?|(+: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|(+: 63;
sym$symbol=>• θsym|(+;
sym$symbol=>• θtok|(+;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|(+: 63;
sym$symbol=>• sym$generated_symbol|(*: 63;
sym$symbol=>• sym$production_symbol|(*: 63;
sym$symbol=>• sym$imported_production_symbol|(*: 63;
sym$symbol=>• sym$literal_symbol|(*: 63;
sym$symbol=>• sym$escaped_symbol|(*: 63;
sym$symbol=>• sym$assert_function_symbol|(*: 63;
sym$symbol=>• ( pb$production_bodies )|(*;
sym$symbol=>• sym$symbol ?|(*: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|(*: 63;
sym$symbol=>• θsym|(*;
sym$symbol=>• θtok|(*;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|(*: 63;
sym$symbol=>• sym$generated_symbol|↦: 63;
sym$symbol=>• sym$production_symbol|↦: 63;
sym$symbol=>• sym$imported_production_symbol|↦: 63;
sym$symbol=>• sym$literal_symbol|↦: 63;
sym$symbol=>• sym$escaped_symbol|↦: 63;
sym$symbol=>• sym$assert_function_symbol|↦: 63;
sym$symbol=>• ( pb$production_bodies )|↦;
sym$symbol=>• sym$symbol ?|↦: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>• θsym|↦;
sym$symbol=>• θtok|↦;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|↦: 63;
sym$symbol=>• sym$generated_symbol|f: 63;
sym$symbol=>• sym$production_symbol|f: 63;
sym$symbol=>• sym$imported_production_symbol|f: 63;
sym$symbol=>• sym$literal_symbol|f: 63;
sym$symbol=>• sym$escaped_symbol|f: 63;
sym$symbol=>• sym$assert_function_symbol|f: 63;
sym$symbol=>• ( pb$production_bodies )|f;
sym$symbol=>• sym$symbol ?|f: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|f: 63;
sym$symbol=>• θsym|f;
sym$symbol=>• θtok|f;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|f: 63;
sym$symbol=>• sym$generated_symbol|(: 63;
sym$symbol=>• sym$production_symbol|(: 63;
sym$symbol=>• sym$imported_production_symbol|(: 63;
sym$symbol=>• sym$literal_symbol|(: 63;
sym$symbol=>• sym$escaped_symbol|(: 63;
sym$symbol=>• sym$assert_function_symbol|(: 63;
sym$symbol=>• ( pb$production_bodies )|(;
sym$symbol=>• sym$symbol ?|(: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|(: 63;
sym$symbol=>• θsym|(;
sym$symbol=>• θtok|(;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|(: 63;
sym$symbol=>• sym$generated_symbol|θ: 63;
sym$symbol=>• sym$production_symbol|θ: 63;
sym$symbol=>• sym$imported_production_symbol|θ: 63;
sym$symbol=>• sym$literal_symbol|θ: 63;
sym$symbol=>• sym$escaped_symbol|θ: 63;
sym$symbol=>• sym$assert_function_symbol|θ: 63;
sym$symbol=>• ( pb$production_bodies )|θ;
sym$symbol=>• sym$symbol ?|θ: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|θ: 63;
sym$symbol=>• θsym|θ;
sym$symbol=>• θtok|θ;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|θ: 63;
sym$symbol=>• sym$generated_symbol|g: 63;
sym$symbol=>• sym$production_symbol|g: 63;
sym$symbol=>• sym$imported_production_symbol|g: 63;
sym$symbol=>• sym$literal_symbol|g: 63;
sym$symbol=>• sym$escaped_symbol|g: 63;
sym$symbol=>• sym$assert_function_symbol|g: 63;
sym$symbol=>• ( pb$production_bodies )|g;
sym$symbol=>• sym$symbol ?|g: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|g: 63;
sym$symbol=>• θsym|g;
sym$symbol=>• θtok|g;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|g: 63;
sym$symbol=>• sym$generated_symbol|_: 63;
sym$symbol=>• sym$production_symbol|_: 63;
sym$symbol=>• sym$imported_production_symbol|_: 63;
sym$symbol=>• sym$literal_symbol|_: 63;
sym$symbol=>• sym$escaped_symbol|_: 63;
sym$symbol=>• sym$assert_function_symbol|_: 63;
sym$symbol=>• ( pb$production_bodies )|_;
sym$symbol=>• sym$symbol ?|_: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|_: 63;
sym$symbol=>• θsym|_;
sym$symbol=>• θtok|_;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|_: 63;
sym$symbol=>• sym$generated_symbol|$: 63;
sym$symbol=>• sym$production_symbol|$: 63;
sym$symbol=>• sym$imported_production_symbol|$: 63;
sym$symbol=>• sym$literal_symbol|$: 63;
sym$symbol=>• sym$escaped_symbol|$: 63;
sym$symbol=>• sym$assert_function_symbol|$: 63;
sym$symbol=>• ( pb$production_bodies )|$;
sym$symbol=>• sym$symbol ?|$: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|$: 63;
sym$symbol=>• θsym|$;
sym$symbol=>• θtok|$;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|$: 63;
sym$symbol=>• sym$generated_symbol|id: 63;
sym$symbol=>• sym$production_symbol|id: 63;
sym$symbol=>• sym$imported_production_symbol|id: 63;
sym$symbol=>• sym$literal_symbol|id: 63;
sym$symbol=>• sym$escaped_symbol|id: 63;
sym$symbol=>• sym$assert_function_symbol|id: 63;
sym$symbol=>• ( pb$production_bodies )|id;
sym$symbol=>• sym$symbol ?|id: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|id: 63;
sym$symbol=>• θsym|id;
sym$symbol=>• θtok|id;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|id: 63;
sym$symbol=>• sym$generated_symbol|key: 63;
sym$symbol=>• sym$production_symbol|key: 63;
sym$symbol=>• sym$imported_production_symbol|key: 63;
sym$symbol=>• sym$literal_symbol|key: 63;
sym$symbol=>• sym$escaped_symbol|key: 63;
sym$symbol=>• sym$assert_function_symbol|key: 63;
sym$symbol=>• ( pb$production_bodies )|key;
sym$symbol=>• sym$symbol ?|key: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|key: 63;
sym$symbol=>• θsym|key;
sym$symbol=>• θtok|key;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|key: 63;
sym$symbol=>• sym$generated_symbol|τ: 63;
sym$symbol=>• sym$production_symbol|τ: 63;
sym$symbol=>• sym$imported_production_symbol|τ: 63;
sym$symbol=>• sym$literal_symbol|τ: 63;
sym$symbol=>• sym$escaped_symbol|τ: 63;
sym$symbol=>• sym$assert_function_symbol|τ: 63;
sym$symbol=>• ( pb$production_bodies )|τ;
sym$symbol=>• sym$symbol ?|τ: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|τ: 63;
sym$symbol=>• θsym|τ;
sym$symbol=>• θtok|τ;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|τ: 63;
sym$symbol=>• sym$generated_symbol|t: 63;
sym$symbol=>• sym$production_symbol|t: 63;
sym$symbol=>• sym$imported_production_symbol|t: 63;
sym$symbol=>• sym$literal_symbol|t: 63;
sym$symbol=>• sym$escaped_symbol|t: 63;
sym$symbol=>• sym$assert_function_symbol|t: 63;
sym$symbol=>• ( pb$production_bodies )|t;
sym$symbol=>• sym$symbol ?|t: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|t: 63;
sym$symbol=>• θsym|t;
sym$symbol=>• θtok|t;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|t: 63;
sym$symbol=>• sym$generated_symbol|\: 63;
sym$symbol=>• sym$production_symbol|\: 63;
sym$symbol=>• sym$imported_production_symbol|\: 63;
sym$symbol=>• sym$literal_symbol|\: 63;
sym$symbol=>• sym$escaped_symbol|\: 63;
sym$symbol=>• sym$assert_function_symbol|\: 63;
sym$symbol=>• ( pb$production_bodies )|\;
sym$symbol=>• sym$symbol ?|\: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|\: 63;
sym$symbol=>• θsym|\;
sym$symbol=>• θtok|\;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|\: 63;
sym$symbol=>• sym$generated_symbol|assert: 63;
sym$symbol=>• sym$production_symbol|assert: 63;
sym$symbol=>• sym$imported_production_symbol|assert: 63;
sym$symbol=>• sym$literal_symbol|assert: 63;
sym$symbol=>• sym$escaped_symbol|assert: 63;
sym$symbol=>• sym$assert_function_symbol|assert: 63;
sym$symbol=>• ( pb$production_bodies )|assert;
sym$symbol=>• sym$symbol ?|assert: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|assert: 63;
sym$symbol=>• θsym|assert;
sym$symbol=>• θtok|assert;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|assert: 63;
sym$symbol=>• sym$generated_symbol|shift: 63;
sym$symbol=>• sym$production_symbol|shift: 63;
sym$symbol=>• sym$imported_production_symbol|shift: 63;
sym$symbol=>• sym$literal_symbol|shift: 63;
sym$symbol=>• sym$escaped_symbol|shift: 63;
sym$symbol=>• sym$assert_function_symbol|shift: 63;
sym$symbol=>• ( pb$production_bodies )|shift;
sym$symbol=>• sym$symbol ?|shift: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|shift: 63;
sym$symbol=>• θsym|shift;
sym$symbol=>• θtok|shift;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|shift: 63;
sym$symbol=>• sym$generated_symbol|sym: 63;
sym$symbol=>• sym$production_symbol|sym: 63;
sym$symbol=>• sym$imported_production_symbol|sym: 63;
sym$symbol=>• sym$literal_symbol|sym: 63;
sym$symbol=>• sym$escaped_symbol|sym: 63;
sym$symbol=>• sym$assert_function_symbol|sym: 63;
sym$symbol=>• ( pb$production_bodies )|sym;
sym$symbol=>• sym$symbol ?|sym: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|sym: 63;
sym$symbol=>• θsym|sym;
sym$symbol=>• θtok|sym;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|sym: 63;
sym$symbol=>• sym$generated_symbol|tok: 63;
sym$symbol=>• sym$production_symbol|tok: 63;
sym$symbol=>• sym$imported_production_symbol|tok: 63;
sym$symbol=>• sym$literal_symbol|tok: 63;
sym$symbol=>• sym$escaped_symbol|tok: 63;
sym$symbol=>• sym$assert_function_symbol|tok: 63;
sym$symbol=>• ( pb$production_bodies )|tok;
sym$symbol=>• sym$symbol ?|tok: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|tok: 63;
sym$symbol=>• θsym|tok;
sym$symbol=>• θtok|tok;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|tok: 63;
sym$symbol=>• sym$generated_symbol|]: 63;
sym$symbol=>• sym$production_symbol|]: 63;
sym$symbol=>• sym$imported_production_symbol|]: 63;
sym$symbol=>• sym$literal_symbol|]: 63;
sym$symbol=>• sym$escaped_symbol|]: 63;
sym$symbol=>• sym$assert_function_symbol|]: 63;
sym$symbol=>• ( pb$production_bodies )|];
sym$symbol=>• sym$symbol ?|]: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|]: 63;
sym$symbol=>• θsym|];
sym$symbol=>• θtok|];
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|]: 63;
sym$symbol=>• sym$generated_symbol|│: 63;
sym$symbol=>• sym$production_symbol|│: 63;
sym$symbol=>• sym$imported_production_symbol|│: 63;
sym$symbol=>• sym$literal_symbol|│: 63;
sym$symbol=>• sym$escaped_symbol|│: 63;
sym$symbol=>• sym$assert_function_symbol|│: 63;
sym$symbol=>• ( pb$production_bodies )|│;
sym$symbol=>• sym$symbol ?|│: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|│: 63;
sym$symbol=>• θsym|│;
sym$symbol=>• θtok|│;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|│: 63;
sym$symbol=>• sym$generated_symbol||: 63;
sym$symbol=>• sym$production_symbol||: 63;
sym$symbol=>• sym$imported_production_symbol||: 63;
sym$symbol=>• sym$literal_symbol||: 63;
sym$symbol=>• sym$escaped_symbol||: 63;
sym$symbol=>• sym$assert_function_symbol||: 63;
sym$symbol=>• ( pb$production_bodies )||;
sym$symbol=>• sym$symbol ?||: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )||: 63;
sym$symbol=>• θsym||;
sym$symbol=>• θtok||;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )||: 63;
sym$symbol=>• sym$generated_symbol|#: 63;
sym$symbol=>• sym$production_symbol|#: 63;
sym$symbol=>• sym$imported_production_symbol|#: 63;
sym$symbol=>• sym$literal_symbol|#: 63;
sym$symbol=>• sym$escaped_symbol|#: 63;
sym$symbol=>• sym$assert_function_symbol|#: 63;
sym$symbol=>• ( pb$production_bodies )|#;
sym$symbol=>• sym$symbol ?|#: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|#: 63;
sym$symbol=>• θsym|#;
sym$symbol=>• θtok|#;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|#: 63;
sym$symbol=>• sym$generated_symbol|<>: 63;
sym$symbol=>• sym$production_symbol|<>: 63;
sym$symbol=>• sym$imported_production_symbol|<>: 63;
sym$symbol=>• sym$literal_symbol|<>: 63;
sym$symbol=>• sym$escaped_symbol|<>: 63;
sym$symbol=>• sym$assert_function_symbol|<>: 63;
sym$symbol=>• ( pb$production_bodies )|<>;
sym$symbol=>• sym$symbol ?|<>: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|<>: 63;
sym$symbol=>• θsym|<>;
sym$symbol=>• θtok|<>;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|<>: 63;
sym$symbol=>• sym$generated_symbol|+>: 63;
sym$symbol=>• sym$production_symbol|+>: 63;
sym$symbol=>• sym$imported_production_symbol|+>: 63;
sym$symbol=>• sym$literal_symbol|+>: 63;
sym$symbol=>• sym$escaped_symbol|+>: 63;
sym$symbol=>• sym$assert_function_symbol|+>: 63;
sym$symbol=>• ( pb$production_bodies )|+>;
sym$symbol=>• sym$symbol ?|+>: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|+>: 63;
sym$symbol=>• θsym|+>;
sym$symbol=>• θtok|+>;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|+>: 63;
sym$symbol=>• sym$generated_symbol|END_OF_FILE: 63;
sym$symbol=>• sym$production_symbol|END_OF_FILE: 63;
sym$symbol=>• sym$imported_production_symbol|END_OF_FILE: 63;
sym$symbol=>• sym$literal_symbol|END_OF_FILE: 63;
sym$symbol=>• sym$escaped_symbol|END_OF_FILE: 63;
sym$symbol=>• sym$assert_function_symbol|END_OF_FILE: 63;
sym$symbol=>• ( pb$production_bodies )|END_OF_FILE;
sym$symbol=>• sym$symbol ?|END_OF_FILE: 63;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 sym$terminal_symbol )|END_OF_FILE: 63;
sym$symbol=>• θsym|END_OF_FILE;
sym$symbol=>• θtok|END_OF_FILE;
sym$symbol=>• sym$symbol sym$symbol_group_031_105 )|END_OF_FILE: 63
*/
_skip(l, const__)
if(idm311.has(l.id)){idm311.get(l.id)(l); } else if(tym311.has(l.ty)){tym311.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 75: //sym$imported_production_symbol
State246(l)
 break;
case 74: //sym$production_symbol
State245(l)
 break;
case 73: //sym$escaped_symbol
State248(l)
 break;
case 71: //sym$literal_symbol
State247(l)
 break;
case 68: //sym$generated_symbol
State244(l)
 break;
case 66: //sym$assert_function_symbol
State249(l)
 break;
case 63: //sym$symbol
if(const_7_.includes(l.id)||l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State313(cp)
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
    function State312 (l: Lexer): void{
                /*
sym$symbol=>( • pb$production_bodies )|): 63;
sym$symbol=>( • pb$production_bodies )|?: 63;
sym$symbol=>( • pb$production_bodies )|(+: 63;
sym$symbol=>( • pb$production_bodies )|(*: 63;
sym$symbol=>( • pb$production_bodies )|↦: 63;
sym$symbol=>( • pb$production_bodies )|f: 63;
sym$symbol=>( • pb$production_bodies )|(: 63;
sym$symbol=>( • pb$production_bodies )|θ: 63;
sym$symbol=>( • pb$production_bodies )|g: 63;
sym$symbol=>( • pb$production_bodies )|_: 63;
sym$symbol=>( • pb$production_bodies )|$: 63;
sym$symbol=>( • pb$production_bodies )|id: 63;
sym$symbol=>( • pb$production_bodies )|key: 63;
sym$symbol=>( • pb$production_bodies )|τ: 63;
sym$symbol=>( • pb$production_bodies )|t: 63;
sym$symbol=>( • pb$production_bodies )|\: 63;
sym$symbol=>( • pb$production_bodies )|assert: 63;
sym$symbol=>( • pb$production_bodies )|shift: 63;
sym$symbol=>( • pb$production_bodies )|sym: 63;
sym$symbol=>( • pb$production_bodies )|tok: 63;
sym$symbol=>( • pb$production_bodies )|]: 63;
sym$symbol=>( • pb$production_bodies )|│: 63;
sym$symbol=>( • pb$production_bodies )||: 63;
sym$symbol=>( • pb$production_bodies )|#: 63;
sym$symbol=>( • pb$production_bodies )|<>: 63;
sym$symbol=>( • pb$production_bodies )|+>: 63;
sym$symbol=>( • pb$production_bodies )|END_OF_FILE: 63
*/
_skip(l, const__)
if(idm295.has(l.id)){idm295.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $pb$production_bodies(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
if(const_7_.includes(l.id)||l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ return;}
State242(l)
 break;
case 31: //pb$body_entries
State236(l)
 break;
case 30: //pb$entries
State234(l)
 break;
case 29: //pb$production_body
State231(l)
 break;
case 28: //pb$production_bodies
State354(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State313 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|): 63;
sym$symbol=>sym$symbol • ?|?;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|?: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|?: 63;
sym$symbol=>sym$symbol • ?|(+;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(+: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(+: 63;
sym$symbol=>sym$symbol • ?|(*;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(*: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(*: 63;
sym$symbol=>sym$symbol • ?|↦;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|↦: 63;
sym$symbol=>sym$symbol • ?|f;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|f: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|f: 63;
sym$symbol=>sym$symbol • ?|(;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(: 63;
sym$symbol=>sym$symbol • ?|θ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|θ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|θ: 63;
sym$symbol=>sym$symbol • ?|g;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|g: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|g: 63;
sym$symbol=>sym$symbol • ?|_;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|_: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|_: 63;
sym$symbol=>sym$symbol • ?|$;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|$: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|$: 63;
sym$symbol=>sym$symbol • ?|id;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|id: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|id: 63;
sym$symbol=>sym$symbol • ?|key;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|key: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|key: 63;
sym$symbol=>sym$symbol • ?|τ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|τ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|τ: 63;
sym$symbol=>sym$symbol • ?|t;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|t: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|t: 63;
sym$symbol=>sym$symbol • ?|\;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|\: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|\: 63;
sym$symbol=>sym$symbol • ?|assert;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|assert: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|assert: 63;
sym$symbol=>sym$symbol • ?|shift;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|shift: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|shift: 63;
sym$symbol=>sym$symbol • ?|sym;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|sym: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|sym: 63;
sym$symbol=>sym$symbol • ?|tok;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|tok: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|tok: 63;
sym$symbol=>sym$symbol • ?|];
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|]: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|]: 63;
sym$symbol=>sym$symbol • ?|│;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|│: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|│: 63;
sym$symbol=>sym$symbol • ?||;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )||: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )||: 63;
sym$symbol=>sym$symbol • ?|#;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|#: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|#: 63;
sym$symbol=>sym$symbol • ?|<>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|<>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|<>: 63;
sym$symbol=>sym$symbol • ?|+>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|+>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|+>: 63;
sym$symbol=>sym$symbol • ?|END_OF_FILE;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|END_OF_FILE: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|END_OF_FILE: 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_031_105
State315(l)
 break;
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State314 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol ? •|θ;
sym$symbol=>sym$symbol ? •|?;
sym$symbol=>sym$symbol ? •|(+;
sym$symbol=>sym$symbol ? •|(*;
sym$symbol=>sym$symbol ? •|g;
sym$symbol=>sym$symbol ? •|_;
sym$symbol=>sym$symbol ? •|$;
sym$symbol=>sym$symbol ? •|id;
sym$symbol=>sym$symbol ? •|key;
sym$symbol=>sym$symbol ? •|τ;
sym$symbol=>sym$symbol ? •|t;
sym$symbol=>sym$symbol ? •|\;
sym$symbol=>sym$symbol ? •|assert;
sym$symbol=>sym$symbol ? •|shift;
sym$symbol=>sym$symbol ? •|sym;
sym$symbol=>sym$symbol ? •|tok;
sym$symbol=>sym$symbol ? •|(;
sym$symbol=>sym$symbol ? •|↦;
sym$symbol=>sym$symbol ? •|f;
sym$symbol=>sym$symbol ? •|│;
sym$symbol=>sym$symbol ? •||;
sym$symbol=>sym$symbol ? •|#;
sym$symbol=>sym$symbol ? •|);
sym$symbol=>sym$symbol ? •|<>;
sym$symbol=>sym$symbol ? •|+>;
sym$symbol=>sym$symbol ? •|END_OF_FILE;
sym$symbol=>sym$symbol ? •|]
*/
_skip(l, const__)
if(idm314r.has(l.id)){idm314r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(56,2,63); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State315 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|θ: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|θ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|?: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|?;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|(+: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|(*: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|(+;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|(*;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|g: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|g;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|_: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|_;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|$: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|$;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|id: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|id;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|key: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|key;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|τ: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|τ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|t: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|t;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|\: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|\;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|assert: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|assert;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|shift: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|shift;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|sym: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|sym;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|tok: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|tok;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|(: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|(;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|↦;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|f: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|f;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|│: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|│;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )||: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )||;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|#: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|#;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|);
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|<>: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|<>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|+>: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|+>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|END_OF_FILE: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|END_OF_FILE;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • sym$terminal_symbol )|]: 63;
sym$symbol=>sym$symbol sym$symbol_group_031_105 • )|]
*/
_skip(l, const__)
if(idm315.has(l.id)){idm315.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61: //sym$terminal_symbol
State345(l)
 break;
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State335 (l: Lexer): void{
                /*
pb$entries=>pb$body_entries fn$reduce_function •|│;
pb$entries=>pb$body_entries fn$reduce_function •||;
pb$entries=>pb$body_entries fn$reduce_function •|#;
pb$entries=>pb$body_entries fn$reduce_function •|);
pb$entries=>pb$body_entries fn$reduce_function •|<>;
pb$entries=>pb$body_entries fn$reduce_function •|+>;
pb$entries=>pb$body_entries fn$reduce_function •|↦;
pb$entries=>pb$body_entries fn$reduce_function •|f;
pb$entries=>pb$body_entries fn$reduce_function •|END_OF_FILE
*/
_skip(l, const__)
if(idm335r.has(l.id)){idm335r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(30,2,30); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State336 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries fn$function_clause •|↦;
pb$body_entries=>pb$body_entries fn$function_clause •|f;
pb$body_entries=>pb$body_entries fn$function_clause •|(;
pb$body_entries=>pb$body_entries fn$function_clause •|θ;
pb$body_entries=>pb$body_entries fn$function_clause •|g;
pb$body_entries=>pb$body_entries fn$function_clause •|_;
pb$body_entries=>pb$body_entries fn$function_clause •|$;
pb$body_entries=>pb$body_entries fn$function_clause •|id;
pb$body_entries=>pb$body_entries fn$function_clause •|key;
pb$body_entries=>pb$body_entries fn$function_clause •|τ;
pb$body_entries=>pb$body_entries fn$function_clause •|t;
pb$body_entries=>pb$body_entries fn$function_clause •|\;
pb$body_entries=>pb$body_entries fn$function_clause •|assert;
pb$body_entries=>pb$body_entries fn$function_clause •|shift;
pb$body_entries=>pb$body_entries fn$function_clause •|sym;
pb$body_entries=>pb$body_entries fn$function_clause •|tok;
pb$body_entries=>pb$body_entries fn$function_clause •|│;
pb$body_entries=>pb$body_entries fn$function_clause •||;
pb$body_entries=>pb$body_entries fn$function_clause •|#;
pb$body_entries=>pb$body_entries fn$function_clause •|);
pb$body_entries=>pb$body_entries fn$function_clause •|<>;
pb$body_entries=>pb$body_entries fn$function_clause •|+>;
pb$body_entries=>pb$body_entries fn$function_clause •|END_OF_FILE;
pb$body_entries=>pb$body_entries fn$function_clause •|]
*/
_skip(l, const__)
if(idm338r.has(l.id)){idm338r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(35,2,31); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State337 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries pb$condition_clause •|↦;
pb$body_entries=>pb$body_entries pb$condition_clause •|f;
pb$body_entries=>pb$body_entries pb$condition_clause •|(;
pb$body_entries=>pb$body_entries pb$condition_clause •|θ;
pb$body_entries=>pb$body_entries pb$condition_clause •|g;
pb$body_entries=>pb$body_entries pb$condition_clause •|_;
pb$body_entries=>pb$body_entries pb$condition_clause •|$;
pb$body_entries=>pb$body_entries pb$condition_clause •|id;
pb$body_entries=>pb$body_entries pb$condition_clause •|key;
pb$body_entries=>pb$body_entries pb$condition_clause •|τ;
pb$body_entries=>pb$body_entries pb$condition_clause •|t;
pb$body_entries=>pb$body_entries pb$condition_clause •|\;
pb$body_entries=>pb$body_entries pb$condition_clause •|assert;
pb$body_entries=>pb$body_entries pb$condition_clause •|shift;
pb$body_entries=>pb$body_entries pb$condition_clause •|sym;
pb$body_entries=>pb$body_entries pb$condition_clause •|tok;
pb$body_entries=>pb$body_entries pb$condition_clause •|│;
pb$body_entries=>pb$body_entries pb$condition_clause •||;
pb$body_entries=>pb$body_entries pb$condition_clause •|#;
pb$body_entries=>pb$body_entries pb$condition_clause •|);
pb$body_entries=>pb$body_entries pb$condition_clause •|<>;
pb$body_entries=>pb$body_entries pb$condition_clause •|+>;
pb$body_entries=>pb$body_entries pb$condition_clause •|END_OF_FILE;
pb$body_entries=>pb$body_entries pb$condition_clause •|]
*/
_skip(l, const__)
if(idm338r.has(l.id)){idm338r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(35,2,31); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State338 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries sym$symbol •|↦;
pb$body_entries=>pb$body_entries sym$symbol •|f;
pb$body_entries=>pb$body_entries sym$symbol •|(;
pb$body_entries=>pb$body_entries sym$symbol •|θ;
pb$body_entries=>pb$body_entries sym$symbol •|g;
pb$body_entries=>pb$body_entries sym$symbol •|_;
pb$body_entries=>pb$body_entries sym$symbol •|$;
pb$body_entries=>pb$body_entries sym$symbol •|id;
pb$body_entries=>pb$body_entries sym$symbol •|key;
pb$body_entries=>pb$body_entries sym$symbol •|τ;
pb$body_entries=>pb$body_entries sym$symbol •|t;
pb$body_entries=>pb$body_entries sym$symbol •|\;
pb$body_entries=>pb$body_entries sym$symbol •|assert;
pb$body_entries=>pb$body_entries sym$symbol •|shift;
pb$body_entries=>pb$body_entries sym$symbol •|sym;
pb$body_entries=>pb$body_entries sym$symbol •|tok;
pb$body_entries=>pb$body_entries sym$symbol •|│;
pb$body_entries=>pb$body_entries sym$symbol •||;
pb$body_entries=>pb$body_entries sym$symbol •|#;
pb$body_entries=>pb$body_entries sym$symbol •|);
pb$body_entries=>pb$body_entries sym$symbol •|<>;
pb$body_entries=>pb$body_entries sym$symbol •|+>;
pb$body_entries=>pb$body_entries sym$symbol •|END_OF_FILE;
sym$symbol=>sym$symbol • ?|↦;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|↦: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|↦: 63;
sym$symbol=>sym$symbol • ?|?;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|?: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|?: 63;
sym$symbol=>sym$symbol • ?|(+;
sym$symbol=>sym$symbol • ?|(*;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(+: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(*: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(+: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(*: 63;
sym$symbol=>sym$symbol • ?|f;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|f: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|f: 63;
sym$symbol=>sym$symbol • ?|(;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|(: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|(: 63;
sym$symbol=>sym$symbol • ?|θ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|θ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|θ: 63;
sym$symbol=>sym$symbol • ?|g;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|g: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|g: 63;
sym$symbol=>sym$symbol • ?|_;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|_: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|_: 63;
sym$symbol=>sym$symbol • ?|$;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|$: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|$: 63;
sym$symbol=>sym$symbol • ?|id;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|id: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|id: 63;
sym$symbol=>sym$symbol • ?|key;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|key: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|key: 63;
sym$symbol=>sym$symbol • ?|τ;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|τ: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|τ: 63;
sym$symbol=>sym$symbol • ?|t;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|t: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|t: 63;
sym$symbol=>sym$symbol • ?|\;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|\: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|\: 63;
sym$symbol=>sym$symbol • ?|assert;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|assert: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|assert: 63;
sym$symbol=>sym$symbol • ?|shift;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|shift: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|shift: 63;
sym$symbol=>sym$symbol • ?|sym;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|sym: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|sym: 63;
sym$symbol=>sym$symbol • ?|tok;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|tok: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|tok: 63;
sym$symbol=>sym$symbol • ?|│;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|│: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|│: 63;
sym$symbol=>sym$symbol • ?||;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )||: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )||: 63;
sym$symbol=>sym$symbol • ?|#;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|#: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|#: 63;
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|): 63;
sym$symbol=>sym$symbol • ?|<>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|<>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|<>: 63;
sym$symbol=>sym$symbol • ?|+>;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|+>: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|+>: 63;
sym$symbol=>sym$symbol • ?|END_OF_FILE;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|END_OF_FILE: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|END_OF_FILE: 63;
pb$body_entries=>pb$body_entries sym$symbol •|];
sym$symbol=>sym$symbol • ?|];
sym$symbol=>sym$symbol • sym$symbol_group_031_105 sym$terminal_symbol )|]: 63;
sym$symbol=>sym$symbol • sym$symbol_group_031_105 )|]: 63
*/
_skip(l, const__)
if(idm242.has(l.id)){idm242.get(l.id)(l); } else if(idm338r.has(l.id)){idm338r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(35,2,31); stack_ptr-=2;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62: //sym$symbol_group_031_105
State315(l)
 break;
case 31/*pb$body_entries*/:
case 63/*sym$symbol*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pb$body_entries (l: Lexer): void{
                /*
pb$body_entries=>• pb$condition_clause|↦: 31;
pb$body_entries=>• fn$function_clause|↦: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|↦: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|↦: 31;
pb$body_entries=>• pb$body_entries sym$symbol|↦: 31;
pb$body_entries=>• [ pb$body_entries ]|↦;
pb$body_entries=>• sym$symbol|↦: 31;
pb$body_entries=>• pb$condition_clause|f: 31;
pb$body_entries=>• fn$function_clause|f: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|f: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|f: 31;
pb$body_entries=>• pb$body_entries sym$symbol|f: 31;
pb$body_entries=>• [ pb$body_entries ]|f;
pb$body_entries=>• sym$symbol|f: 31;
pb$body_entries=>• pb$condition_clause|(: 31;
pb$body_entries=>• fn$function_clause|(: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|(: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|(: 31;
pb$body_entries=>• pb$body_entries sym$symbol|(: 31;
pb$body_entries=>• [ pb$body_entries ]|(;
pb$body_entries=>• sym$symbol|(: 31;
pb$body_entries=>• pb$condition_clause|θ: 31;
pb$body_entries=>• fn$function_clause|θ: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|θ: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|θ: 31;
pb$body_entries=>• pb$body_entries sym$symbol|θ: 31;
pb$body_entries=>• [ pb$body_entries ]|θ;
pb$body_entries=>• sym$symbol|θ: 31;
pb$body_entries=>• pb$condition_clause|g: 31;
pb$body_entries=>• fn$function_clause|g: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|g: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|g: 31;
pb$body_entries=>• pb$body_entries sym$symbol|g: 31;
pb$body_entries=>• [ pb$body_entries ]|g;
pb$body_entries=>• sym$symbol|g: 31;
pb$body_entries=>• pb$condition_clause|_: 31;
pb$body_entries=>• fn$function_clause|_: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|_: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|_: 31;
pb$body_entries=>• pb$body_entries sym$symbol|_: 31;
pb$body_entries=>• [ pb$body_entries ]|_;
pb$body_entries=>• sym$symbol|_: 31;
pb$body_entries=>• pb$condition_clause|$: 31;
pb$body_entries=>• fn$function_clause|$: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|$: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|$: 31;
pb$body_entries=>• pb$body_entries sym$symbol|$: 31;
pb$body_entries=>• [ pb$body_entries ]|$;
pb$body_entries=>• sym$symbol|$: 31;
pb$body_entries=>• pb$condition_clause|id: 31;
pb$body_entries=>• fn$function_clause|id: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|id: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|id: 31;
pb$body_entries=>• pb$body_entries sym$symbol|id: 31;
pb$body_entries=>• [ pb$body_entries ]|id;
pb$body_entries=>• sym$symbol|id: 31;
pb$body_entries=>• pb$condition_clause|key: 31;
pb$body_entries=>• fn$function_clause|key: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|key: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|key: 31;
pb$body_entries=>• pb$body_entries sym$symbol|key: 31;
pb$body_entries=>• [ pb$body_entries ]|key;
pb$body_entries=>• sym$symbol|key: 31;
pb$body_entries=>• pb$condition_clause|τ: 31;
pb$body_entries=>• fn$function_clause|τ: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|τ: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|τ: 31;
pb$body_entries=>• pb$body_entries sym$symbol|τ: 31;
pb$body_entries=>• [ pb$body_entries ]|τ;
pb$body_entries=>• sym$symbol|τ: 31;
pb$body_entries=>• pb$condition_clause|t: 31;
pb$body_entries=>• fn$function_clause|t: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|t: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|t: 31;
pb$body_entries=>• pb$body_entries sym$symbol|t: 31;
pb$body_entries=>• [ pb$body_entries ]|t;
pb$body_entries=>• sym$symbol|t: 31;
pb$body_entries=>• pb$condition_clause|\: 31;
pb$body_entries=>• fn$function_clause|\: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|\: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|\: 31;
pb$body_entries=>• pb$body_entries sym$symbol|\: 31;
pb$body_entries=>• [ pb$body_entries ]|\;
pb$body_entries=>• sym$symbol|\: 31;
pb$body_entries=>• pb$condition_clause|assert: 31;
pb$body_entries=>• fn$function_clause|assert: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|assert: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|assert: 31;
pb$body_entries=>• pb$body_entries sym$symbol|assert: 31;
pb$body_entries=>• [ pb$body_entries ]|assert;
pb$body_entries=>• sym$symbol|assert: 31;
pb$body_entries=>• pb$condition_clause|shift: 31;
pb$body_entries=>• fn$function_clause|shift: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|shift: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|shift: 31;
pb$body_entries=>• pb$body_entries sym$symbol|shift: 31;
pb$body_entries=>• [ pb$body_entries ]|shift;
pb$body_entries=>• sym$symbol|shift: 31;
pb$body_entries=>• pb$condition_clause|sym: 31;
pb$body_entries=>• fn$function_clause|sym: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|sym: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|sym: 31;
pb$body_entries=>• pb$body_entries sym$symbol|sym: 31;
pb$body_entries=>• [ pb$body_entries ]|sym;
pb$body_entries=>• sym$symbol|sym: 31;
pb$body_entries=>• pb$condition_clause|tok: 31;
pb$body_entries=>• fn$function_clause|tok: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|tok: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|tok: 31;
pb$body_entries=>• pb$body_entries sym$symbol|tok: 31;
pb$body_entries=>• [ pb$body_entries ]|tok;
pb$body_entries=>• sym$symbol|tok: 31;
pb$body_entries=>• pb$condition_clause|]: 31;
pb$body_entries=>• fn$function_clause|]: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|]: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|]: 31;
pb$body_entries=>• pb$body_entries sym$symbol|]: 31;
pb$body_entries=>• [ pb$body_entries ]|];
pb$body_entries=>• sym$symbol|]: 31;
pb$body_entries=>• pb$condition_clause|│: 31;
pb$body_entries=>• fn$function_clause|│: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|│: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|│: 31;
pb$body_entries=>• pb$body_entries sym$symbol|│: 31;
pb$body_entries=>• [ pb$body_entries ]|│;
pb$body_entries=>• sym$symbol|│: 31;
pb$body_entries=>• pb$condition_clause||: 31;
pb$body_entries=>• fn$function_clause||: 31;
pb$body_entries=>• pb$body_entries fn$function_clause||: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause||: 31;
pb$body_entries=>• pb$body_entries sym$symbol||: 31;
pb$body_entries=>• [ pb$body_entries ]||;
pb$body_entries=>• sym$symbol||: 31;
pb$body_entries=>• pb$condition_clause|#: 31;
pb$body_entries=>• fn$function_clause|#: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|#: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|#: 31;
pb$body_entries=>• pb$body_entries sym$symbol|#: 31;
pb$body_entries=>• [ pb$body_entries ]|#;
pb$body_entries=>• sym$symbol|#: 31;
pb$body_entries=>• pb$condition_clause|): 31;
pb$body_entries=>• fn$function_clause|): 31;
pb$body_entries=>• pb$body_entries fn$function_clause|): 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|): 31;
pb$body_entries=>• pb$body_entries sym$symbol|): 31;
pb$body_entries=>• [ pb$body_entries ]|);
pb$body_entries=>• sym$symbol|): 31;
pb$body_entries=>• pb$condition_clause|<>: 31;
pb$body_entries=>• fn$function_clause|<>: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|<>: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|<>: 31;
pb$body_entries=>• pb$body_entries sym$symbol|<>: 31;
pb$body_entries=>• [ pb$body_entries ]|<>;
pb$body_entries=>• sym$symbol|<>: 31;
pb$body_entries=>• pb$condition_clause|+>: 31;
pb$body_entries=>• fn$function_clause|+>: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|+>: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|+>: 31;
pb$body_entries=>• pb$body_entries sym$symbol|+>: 31;
pb$body_entries=>• [ pb$body_entries ]|+>;
pb$body_entries=>• sym$symbol|+>: 31;
pb$body_entries=>• pb$condition_clause|END_OF_FILE: 31;
pb$body_entries=>• fn$function_clause|END_OF_FILE: 31;
pb$body_entries=>• pb$body_entries fn$function_clause|END_OF_FILE: 31;
pb$body_entries=>• pb$body_entries pb$condition_clause|END_OF_FILE: 31;
pb$body_entries=>• pb$body_entries sym$symbol|END_OF_FILE: 31;
pb$body_entries=>• [ pb$body_entries ]|END_OF_FILE;
pb$body_entries=>• sym$symbol|END_OF_FILE: 31
*/
_skip(l, const__)
if(idm340.has(l.id)){idm340.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State242(l)
 break;
case 38: //fn$function_clause
State240(l)
 break;
case 33: //pb$condition_clause
State239(l)
 break;
case 31: //pb$body_entries
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 24/* \│ */||l.id == 25/* \| */||l.id == 29/* \] */||l.id == 32/* \) */||l.id == 50/* \# */||l.ty == 0 /*--*//* EOF */){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State341(cp)
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
    function State341 (l: Lexer): void{
                /*
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 31;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|f: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|f: 31;
pb$body_entries=>pb$body_entries • sym$symbol|f: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|(: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|(: 31;
pb$body_entries=>pb$body_entries • sym$symbol|(: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|θ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|θ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|θ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|g: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|g: 31;
pb$body_entries=>pb$body_entries • sym$symbol|g: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|_: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|_: 31;
pb$body_entries=>pb$body_entries • sym$symbol|_: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|$: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|$: 31;
pb$body_entries=>pb$body_entries • sym$symbol|$: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|id: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|id: 31;
pb$body_entries=>pb$body_entries • sym$symbol|id: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|key: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|key: 31;
pb$body_entries=>pb$body_entries • sym$symbol|key: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|τ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|τ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|τ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|t: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|t: 31;
pb$body_entries=>pb$body_entries • sym$symbol|t: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|\: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|\: 31;
pb$body_entries=>pb$body_entries • sym$symbol|\: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|assert: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|assert: 31;
pb$body_entries=>pb$body_entries • sym$symbol|assert: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|shift: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|shift: 31;
pb$body_entries=>pb$body_entries • sym$symbol|shift: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|sym: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|sym: 31;
pb$body_entries=>pb$body_entries • sym$symbol|sym: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|tok: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|tok: 31;
pb$body_entries=>pb$body_entries • sym$symbol|tok: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|]: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|]: 31;
pb$body_entries=>pb$body_entries • sym$symbol|]: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|│: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|│: 31;
pb$body_entries=>pb$body_entries • sym$symbol|│: 31;
pb$body_entries=>pb$body_entries • fn$function_clause||: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause||: 31;
pb$body_entries=>pb$body_entries • sym$symbol||: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|#: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|#: 31;
pb$body_entries=>pb$body_entries • sym$symbol|#: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|): 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|): 31;
pb$body_entries=>pb$body_entries • sym$symbol|): 31;
pb$body_entries=>pb$body_entries • fn$function_clause|<>: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|<>: 31;
pb$body_entries=>pb$body_entries • sym$symbol|<>: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|+>: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|+>: 31;
pb$body_entries=>pb$body_entries • sym$symbol|+>: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|END_OF_FILE: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|END_OF_FILE: 31;
pb$body_entries=>pb$body_entries • sym$symbol|END_OF_FILE: 31
*/
_skip(l, const__)
if(idm341.has(l.id)){idm341.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State338(l)
 break;
case 38: //fn$function_clause
State336(l)
 break;
case 33: //pb$condition_clause
State337(l)
 break;
case 31/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State342 (l: Lexer): void{
                /*
pb$body_entries=>[ pb$body_entries • ]|↦;
pb$body_entries=>[ pb$body_entries • ]|f;
pb$body_entries=>[ pb$body_entries • ]|(;
pb$body_entries=>[ pb$body_entries • ]|θ;
pb$body_entries=>[ pb$body_entries • ]|g;
pb$body_entries=>[ pb$body_entries • ]|_;
pb$body_entries=>[ pb$body_entries • ]|$;
pb$body_entries=>[ pb$body_entries • ]|id;
pb$body_entries=>[ pb$body_entries • ]|key;
pb$body_entries=>[ pb$body_entries • ]|τ;
pb$body_entries=>[ pb$body_entries • ]|t;
pb$body_entries=>[ pb$body_entries • ]|\;
pb$body_entries=>[ pb$body_entries • ]|assert;
pb$body_entries=>[ pb$body_entries • ]|shift;
pb$body_entries=>[ pb$body_entries • ]|sym;
pb$body_entries=>[ pb$body_entries • ]|tok;
pb$body_entries=>[ pb$body_entries • ]|│;
pb$body_entries=>[ pb$body_entries • ]||;
pb$body_entries=>[ pb$body_entries • ]|#;
pb$body_entries=>[ pb$body_entries • ]|);
pb$body_entries=>[ pb$body_entries • ]|<>;
pb$body_entries=>[ pb$body_entries • ]|+>;
pb$body_entries=>[ pb$body_entries • ]|END_OF_FILE;
pb$body_entries=>pb$body_entries • fn$function_clause|]: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|]: 31;
pb$body_entries=>pb$body_entries • sym$symbol|]: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|f: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|f: 31;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 31;
pb$body_entries=>pb$body_entries • sym$symbol|f: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|(: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|(: 31;
pb$body_entries=>pb$body_entries • sym$symbol|(: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|θ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|g: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|_: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|$: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|id: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|key: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|τ: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|t: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|\: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|assert: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|shift: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|sym: 31;
pb$body_entries=>pb$body_entries • fn$function_clause|tok: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|θ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|g: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|_: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|$: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|id: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|key: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|τ: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|t: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|\: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|assert: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|shift: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|sym: 31;
pb$body_entries=>pb$body_entries • pb$condition_clause|tok: 31;
pb$body_entries=>pb$body_entries • sym$symbol|θ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|g: 31;
pb$body_entries=>pb$body_entries • sym$symbol|_: 31;
pb$body_entries=>pb$body_entries • sym$symbol|$: 31;
pb$body_entries=>pb$body_entries • sym$symbol|id: 31;
pb$body_entries=>pb$body_entries • sym$symbol|key: 31;
pb$body_entries=>pb$body_entries • sym$symbol|τ: 31;
pb$body_entries=>pb$body_entries • sym$symbol|t: 31;
pb$body_entries=>pb$body_entries • sym$symbol|\: 31;
pb$body_entries=>pb$body_entries • sym$symbol|assert: 31;
pb$body_entries=>pb$body_entries • sym$symbol|shift: 31;
pb$body_entries=>pb$body_entries • sym$symbol|sym: 31;
pb$body_entries=>pb$body_entries • sym$symbol|tok: 31;
pb$body_entries=>[ pb$body_entries • ]|]
*/
_skip(l, const__)
if(idm342.has(l.id)){idm342.get(l.id)(l); } else if(l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            $sym$symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63: //sym$symbol
State338(l)
 break;
case 38: //fn$function_clause
State336(l)
 break;
case 33: //pb$condition_clause
State337(l)
 break;
case 31/*pb$body_entries*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State344 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|<>;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|+>;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|#;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|↦;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|f;
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|END_OF_FILE;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 28;
pb$production_bodies=>pb$production_bodies • cm$comment||: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|#: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|+>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|+>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|↦: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|↦: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|f: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|f: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm344.has(l.id)){idm344.get(l.id)(l); } else if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(22,4,24); stack_ptr-=4;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(22,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State308(l)
 break;
case 27: //pb$production_bodies_group_04_100
State307(l)
 break;
case 24/*prd$production*/:
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State345 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|θ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|?;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|(+;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|(*;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|g;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|_;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|$;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|id;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|key;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|τ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|t;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|\;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|assert;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|shift;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|sym;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|tok;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|(;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|↦;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|f;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|│;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )||;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|#;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|);
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|<>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|+>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|END_OF_FILE;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol • )|]
*/
_skip(l, const__)
if(l.id == 32/* \) */){ 
             
            _no_check(l);;stack_ptr++;State370(l);
             
            }
else fail(l);
}
    function State346 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|θ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|?;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|(+;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|(*;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|g;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|_;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|$;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|id;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|key;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|τ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|t;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|\;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|assert;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|shift;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|sym;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|tok;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|(;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|↦;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|f;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|│;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •||;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|#;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|);
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|<>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|+>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|END_OF_FILE;
sym$symbol=>sym$symbol sym$symbol_group_031_105 ) •|]
*/
_skip(l, const__)
if(idm346r.has(l.id)){idm346r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(57,3,63); stack_ptr-=3;
             
            ;return}
else fail(l);
}
    function State354 (l: Lexer): void{
                /*
sym$symbol=>( pb$production_bodies • )|θ;
sym$symbol=>( pb$production_bodies • )|?;
sym$symbol=>( pb$production_bodies • )|(+;
sym$symbol=>( pb$production_bodies • )|(*;
sym$symbol=>( pb$production_bodies • )|g;
sym$symbol=>( pb$production_bodies • )|_;
sym$symbol=>( pb$production_bodies • )|$;
sym$symbol=>( pb$production_bodies • )|id;
sym$symbol=>( pb$production_bodies • )|key;
sym$symbol=>( pb$production_bodies • )|τ;
sym$symbol=>( pb$production_bodies • )|t;
sym$symbol=>( pb$production_bodies • )|\;
sym$symbol=>( pb$production_bodies • )|assert;
sym$symbol=>( pb$production_bodies • )|shift;
sym$symbol=>( pb$production_bodies • )|sym;
sym$symbol=>( pb$production_bodies • )|tok;
sym$symbol=>( pb$production_bodies • )|(;
sym$symbol=>( pb$production_bodies • )|↦;
sym$symbol=>( pb$production_bodies • )|f;
sym$symbol=>( pb$production_bodies • )|│;
sym$symbol=>( pb$production_bodies • )||;
sym$symbol=>( pb$production_bodies • )|#;
sym$symbol=>( pb$production_bodies • )|);
sym$symbol=>( pb$production_bodies • )|<>;
sym$symbol=>( pb$production_bodies • )|+>;
sym$symbol=>( pb$production_bodies • )|END_OF_FILE;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|): 28;
pb$production_bodies=>pb$production_bodies • cm$comment|): 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 28;
pb$production_bodies=>pb$production_bodies • cm$comment||: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|#: 28;
sym$symbol=>( pb$production_bodies • )|]
*/
_skip(l, const__)
if(idm354.has(l.id)){idm354.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State308(l)
 break;
case 27: //pb$production_bodies_group_04_100
State307(l)
 break;
case 63/*sym$symbol*/:
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State356 (l: Lexer): void{
                /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|<>;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|+>;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|#;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|↦;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|f;
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|END_OF_FILE;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 28;
pb$production_bodies=>pb$production_bodies • cm$comment||: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|#: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|+>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|+>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|↦: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|↦: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|f: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|f: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm344.has(l.id)){idm344.get(l.id)(l); } else if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(23,4,24); stack_ptr-=4;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(23,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State308(l)
 break;
case 27: //pb$production_bodies_group_04_100
State307(l)
 break;
case 24/*prd$production*/:
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State362 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|<>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|<>;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|+>: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|+>;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|#: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|#;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|↦: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|↦;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|f: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|f;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|END_OF_FILE: 24;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|END_OF_FILE;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body||: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 28;
pb$production_bodies=>pb$production_bodies • cm$comment||: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|#: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|#: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|<>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|<>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|+>: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|+>: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|↦: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|↦: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|f: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|f: 28;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|END_OF_FILE: 28;
pb$production_bodies=>pb$production_bodies • cm$comment|END_OF_FILE: 28
*/
_skip(l, const__)
if(idm362.has(l.id)){idm362.get(l.id)(l); } else if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(24,4,24); stack_ptr-=4;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(24,4,24); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 44: //cm$comment
State308(l)
 break;
case 27: //pb$production_bodies_group_04_100
State307(l)
 break;
case 22: //prd$production_group_111_102
State384(l)
 break;
case 24/*prd$production*/:
case 28/*pb$production_bodies*/: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State368 (l: Lexer): void{
                /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|│;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •||;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|#;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|);
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|<>;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|+>;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|↦;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|f;
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|END_OF_FILE
*/
_skip(l, const__)
if(idm368r.has(l.id)){idm368r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(26,3,28); stack_ptr-=3;
             
            ;return}
else fail(l);
}
    function State370 (l: Lexer): void{
                /*
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|θ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|?;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|(+;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|(*;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|g;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|_;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|$;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|id;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|key;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|τ;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|t;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|\;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|assert;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|shift;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|sym;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|tok;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|(;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|↦;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|f;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|│;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •||;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|#;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|);
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|<>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|+>;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|END_OF_FILE;
sym$symbol=>sym$symbol sym$symbol_group_031_105 sym$terminal_symbol ) •|]
*/
_skip(l, const__)
if(idm370r.has(l.id)){idm370r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(57,4,63); stack_ptr-=4;
             
            ;return}
else fail(l);
}
    function State376 (l: Lexer): void{
                /*
sym$symbol=>( pb$production_bodies ) •|θ;
sym$symbol=>( pb$production_bodies ) •|?;
sym$symbol=>( pb$production_bodies ) •|(+;
sym$symbol=>( pb$production_bodies ) •|(*;
sym$symbol=>( pb$production_bodies ) •|g;
sym$symbol=>( pb$production_bodies ) •|_;
sym$symbol=>( pb$production_bodies ) •|$;
sym$symbol=>( pb$production_bodies ) •|id;
sym$symbol=>( pb$production_bodies ) •|key;
sym$symbol=>( pb$production_bodies ) •|τ;
sym$symbol=>( pb$production_bodies ) •|t;
sym$symbol=>( pb$production_bodies ) •|\;
sym$symbol=>( pb$production_bodies ) •|assert;
sym$symbol=>( pb$production_bodies ) •|shift;
sym$symbol=>( pb$production_bodies ) •|sym;
sym$symbol=>( pb$production_bodies ) •|tok;
sym$symbol=>( pb$production_bodies ) •|(;
sym$symbol=>( pb$production_bodies ) •|↦;
sym$symbol=>( pb$production_bodies ) •|f;
sym$symbol=>( pb$production_bodies ) •|│;
sym$symbol=>( pb$production_bodies ) •||;
sym$symbol=>( pb$production_bodies ) •|#;
sym$symbol=>( pb$production_bodies ) •|);
sym$symbol=>( pb$production_bodies ) •|<>;
sym$symbol=>( pb$production_bodies ) •|+>;
sym$symbol=>( pb$production_bodies ) •|END_OF_FILE;
sym$symbol=>( pb$production_bodies ) •|]
*/
_skip(l, const__)
if(idm376r.has(l.id)){idm376r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(55,3,63); stack_ptr-=3;
             
            ;return}
else fail(l);
}
    function State384 (l: Lexer): void{
                /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|<>;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|+>;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|#;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|↦;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|f;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|END_OF_FILE
*/
_skip(l, const__)
if(l.id == 21/* \<> */||l.id == 22/* \+> */||l.id == 48/* \↦ */||l.id == 49/* \f */||l.id == 50/* \# */){ 
             
            completeProduction(21,5,24); stack_ptr-=5;
             
            ;return} else if(l.ty == 0 /*--*//* EOF */){ 
             
            completeProduction(21,5,24); stack_ptr-=5;
             
            ;return}
else fail(l);
}
    function State392 (l: Lexer): void{
                /*
pb$body_entries=>[ pb$body_entries ] •|];
pb$body_entries=>[ pb$body_entries ] •|↦;
pb$body_entries=>[ pb$body_entries ] •|f;
pb$body_entries=>[ pb$body_entries ] •|(;
pb$body_entries=>[ pb$body_entries ] •|θ;
pb$body_entries=>[ pb$body_entries ] •|g;
pb$body_entries=>[ pb$body_entries ] •|_;
pb$body_entries=>[ pb$body_entries ] •|$;
pb$body_entries=>[ pb$body_entries ] •|id;
pb$body_entries=>[ pb$body_entries ] •|key;
pb$body_entries=>[ pb$body_entries ] •|τ;
pb$body_entries=>[ pb$body_entries ] •|t;
pb$body_entries=>[ pb$body_entries ] •|\;
pb$body_entries=>[ pb$body_entries ] •|assert;
pb$body_entries=>[ pb$body_entries ] •|shift;
pb$body_entries=>[ pb$body_entries ] •|sym;
pb$body_entries=>[ pb$body_entries ] •|tok;
pb$body_entries=>[ pb$body_entries ] •|│;
pb$body_entries=>[ pb$body_entries ] •||;
pb$body_entries=>[ pb$body_entries ] •|#;
pb$body_entries=>[ pb$body_entries ] •|);
pb$body_entries=>[ pb$body_entries ] •|<>;
pb$body_entries=>[ pb$body_entries ] •|+>;
pb$body_entries=>[ pb$body_entries ] •|END_OF_FILE
*/
_skip(l, const__)
if(idm392r.has(l.id)){idm392r.get(l.id)(l); return;} else if(l.ty == 0 /*--*//* EOF */||l.ty == 3/* \id--- */||l.ty == 5/* \tok--- */||l.ty == 6/* \sym--- */||l.ty == 7/* \key--- */){ 
             
            completeProduction(36,3,31); stack_ptr-=3;
             
            ;return}
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