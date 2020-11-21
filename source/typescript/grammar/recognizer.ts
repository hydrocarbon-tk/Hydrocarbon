
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
if(length <= 6){type = TokenKeyword; this.id =56; length = 6;}
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
if(length <= 5){type = TokenKeyword; this.id =57; length = 5;}
}
}
}
}
}
else if(val == 103 ){
if(length <= 1){type = TokenKeyword; this.id =59; length = 1;}
}
else if(val == 116 ){
if(length <= 1){type = TokenKeyword; this.id =61; length = 1;}
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
type = TokenSymbol; this.id =51 /* (+ */; length = 2;
}
else if(val == 42 ){
type = TokenSymbol; this.id =52 /* (astrix */; length = 2;
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
type = TokenSymbol; this.id =53 /* :: */; length = 2;
}
}
else if(val == 61 ){
type = TokenSymbol; this.id =47 /* = */; length = 1;
}
else if(val == 8614 ){
type = TokenSymbol; this.id =48 /* ↦ */; length = 1;
}
else if(val == 35 ){
type = TokenSymbol; this.id =50 /* # */; length = 1;
}
else if(val == 63 ){
type = TokenSymbol; this.id =54 /* ? */; length = 1;
}
else if(val == 36 ){
type = TokenSymbol; this.id =77 /* $ */; length = 1;
const val: u32 = str.charCodeAt(base+1)
if(val == 101 ){
const val: u32 = str.charCodeAt(base+2)
if(val == 111 ){
const val: u32 = str.charCodeAt(base+3)
if(val == 102 ){
type = TokenSymbol; this.id =55 /* $eof */; length = 4;
}
}
}
}
else if(val == 952 ){
type = TokenSymbol; this.id =58 /* θ */; length = 1;
}
else if(val == 964 ){
type = TokenSymbol; this.id =60 /* τ */; length = 1;
}
else if(val == 92 ){
type = TokenSymbol; this.id =62 /* \ */; length = 1;
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


const const__ = StaticArray.fromArray<u32>([1,4]),
const_0_ = StaticArray.fromArray<u32>([4]),
const_1_ = StaticArray.fromArray<u32>([28,30,48,49,56,57,58,59,60,61,62,76,77]),
const_2_ = StaticArray.fromArray<u32>([1]),
const_4_ = StaticArray.fromArray<u32>([23,28,48,49,55,56,57,58,59,60,61,62,76,77]),
const_5_ = StaticArray.fromArray<u32>([23,28,30,33,34,35,36,37,39,42,48,49,53,55,56,57,58,59,60,61,62,76,77]),
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
_263id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State35(l);
             
            },
_263id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State36(l);
             
            },
_301id0 = (l:Lexer):void => { 
             
            $pb$production_bodies(l); stack_ptr++;
             
            },
_362id0 = (l:Lexer):void => { 
             
            $pb$production_bodies_group_04_100(l); stack_ptr++;
             
            },
_373id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $prd$production_group_111_102(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$production_bodies_group_04_100(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_307id0 = (l:Lexer):void => { 
             
            completeProduction(27,2,29); stack_ptr-=2;
             
            },
_306id0 = (l:Lexer):void => { 
             
            $pb$production_body(l); stack_ptr++;
             
            },
_377id0 = (l:Lexer):void => { 
             
            completeProduction(26,3,29); stack_ptr-=3;
             
            },
_40id0 = (l:Lexer):void => { 
             
            $sym$lexer_symbol(l); stack_ptr++;
             
            },
_42id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,6); stack_ptr-=1;
             
            },
_203id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,6); stack_ptr-=2;
             
            },
_234id0 = (l:Lexer):void => { 
             
            completeProduction(25,1,29); stack_ptr-=1;
             
            },
_98id0 = (l:Lexer):void => { 
             
            $fn$js_primitive(l); stack_ptr++;
             
            },
_98id6 = (l:Lexer):void => { 
             
            $fn$js_data_block(l); stack_ptr++;
             
            },
_98id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State102(l);
             
            },
_102id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,40); stack_ptr-=1;
             
            },
_258id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,40); stack_ptr-=2;
             
            },
_61ty0 = (l:Lexer):void => { 
             
            completeProduction(27,1,48); stack_ptr-=1;
             
            },
_219ty0 = (l:Lexer):void => { 
             
            completeProduction(12,2,48); stack_ptr-=2;
             
            },
const_3_ = StaticArray.fromArray<u32>([21,22,24,25,29,30,32,48,49,50,51,52,54,55,56,57,58,59,60,61,62,76,77]),
_118id0 = (l:Lexer):void => { 
             
            completeProduction(13,1,73); stack_ptr-=1;
             
            },
_259id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,73); stack_ptr-=2;
             
            },
_227id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State197(l);
             
            },
_227id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State198(l);
             
            },
_227ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State199(l);
             
            },
_227ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State167(l);
             
            },
const_6_ = StaticArray.fromArray<u32>([21,22,24,25,26,27,29,30,32,38,39,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62]),
_197id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,102); stack_ptr-=1;
             
            },
_228id0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State269(l);
             
            },
_228id1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State270(l);
             
            },
_228ty0 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State267(l);
             
            },
_228ty1 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State268(l);
             
            },
_228ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State271(l);
             
            },
_228ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State272(l);
             
            },
_228ty4 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State273(l);
             
            },
_228ty5 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State274(l);
             
            },
_267id0 = (l:Lexer):void => { 
             
            completeProduction(12,2,102); stack_ptr-=2;
             
            },
_346id0 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $pb$condition_clause(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_346id1 = (l:Lexer):void => { 
             
            $fn$function_clause(l); stack_ptr++;
             
            },
_346id3 = (l:Lexer):void => { 
             
            $sym$symbol(l); stack_ptr++;
             
            },
_346id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State244(l);
             
            },
_244id0 = (l:Lexer):void => { 
             
            $pb$body_entries(l); stack_ptr++;
             
            },
_245id0 = (l:Lexer):void => { 
             
            $sym$symbol_group_031_105(l); stack_ptr++;
             
            },
_245id2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State311(l);
             
            },
const_7_ = (l:Lexer):void => { 
             
            completeProduction(34,1,32); stack_ptr-=1;
             
            },
_348id12 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State393(l);
             
            },
_311id0 = (l:Lexer):void => { 
             
            completeProduction(56,2,64); stack_ptr-=2;
             
            },
_312id0 = (l:Lexer):void => { 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            },
_312id7 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State353(l);
             
            },
_344id0 = (l:Lexer):void => { 
             
            completeProduction(35,2,32); stack_ptr-=2;
             
            },
_393id0 = (l:Lexer):void => { 
             
            completeProduction(36,3,32); stack_ptr-=3;
             
            },
_353id0 = (l:Lexer):void => { 
             
            completeProduction(57,3,64); stack_ptr-=3;
             
            },
_376id0 = (l:Lexer):void => { 
             
            completeProduction(57,4,64); stack_ptr-=4;
             
            },
_317id0 = (l:Lexer):void => { 
             
            $sym$generated_symbol(l); stack_ptr++;
             
            },
_317id2 = (l:Lexer):void => { 
            let $mark = mark(), sp = stack_ptr, cp = l.copy();
            $sym$imported_production_symbol(cp); stack_ptr++;
            if(FAILED){
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$production_symbol(l); stack_ptr++;;
        }else l.sync(cp);
         
            },
_317id4 = (l:Lexer):void => { 
             
            $sym$literal_symbol(l); stack_ptr++;
             
            },
_317id6 = (l:Lexer):void => { 
             
            $sym$escaped_symbol(l); stack_ptr++;
             
            },
_317id7 = (l:Lexer):void => { 
             
            $sym$assert_function_symbol(l); stack_ptr++;
             
            },
_317id9 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State318(l);
             
            },
_317ty2 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State253(l);
             
            },
_317ty3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State254(l);
             
            },
const_8_ = StaticArray.fromArray<u32>([21,22,24,25,29,30,32,48,49,50,56,57,58,59,60,61,62,76,77]),
_253id0 = (l:Lexer):void => { 
             
            completeProduction(54,1,64); stack_ptr-=1;
             
            },
_249id0 = (l:Lexer):void => { 
             
            completeProductionPlain(1,64); stack_ptr-=1;
             
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
             
            completeProduction(33,1,31); stack_ptr-=1;
             
            },
_237id0 = (l:Lexer):void => { 
             
            completeProduction(29,1,30); stack_ptr-=1;
             
            },
_333id3 = (l:Lexer):void => { 
             
            _no_check(l);;stack_ptr++;State365(l);
             
            },
_341id0 = (l:Lexer):void => { 
             
            completeProduction(30,2,31); stack_ptr-=2;
             
            },
_365id0 = (l:Lexer):void => { 
             
            completeProduction(55,3,64); stack_ptr-=3;
             
            },
_71id0 = (l:Lexer):void => { 
             
            completeProduction(5,1,51); stack_ptr-=1;
             
            },
_220id0 = (l:Lexer):void => { 
             
            completeProduction(4,2,51); stack_ptr-=2;
             
            };
const idm30: Map<number, (L:Lexer)=>void> = new Map()
idm30.set(21,_30id0)
idm30.set(22,_30id0)
idm30.set(48,_30id2)
idm30.set(49,_30id2)
idm30.set(23,_30id4);
const idm33: Map<number, (L:Lexer)=>void> = new Map()
idm33.set(21,_30id0)
idm33.set(22,_30id0)
idm33.set(50,_33id2)
idm33.set(48,_30id2)
idm33.set(49,_30id2);
const idm263: Map<number, (L:Lexer)=>void> = new Map()
idm263.set(21,_263id0)
idm263.set(22,_263id1);
const idm301: Map<number, (L:Lexer)=>void> = new Map()
idm301.set(30,_301id0)
idm301.set(48,_301id0)
idm301.set(49,_301id0)
idm301.set(28,_301id0)
idm301.set(58,_301id0)
idm301.set(59,_301id0)
idm301.set(76,_301id0)
idm301.set(77,_301id0)
idm301.set(60,_301id0)
idm301.set(61,_301id0)
idm301.set(62,_301id0)
idm301.set(56,_301id0)
idm301.set(57,_301id0)
idm301.set(23,_301id0)
idm301.set(55,_301id0);
const tym301: Map<number, (L:Lexer)=>void> = new Map()
tym301.set(3,_301id0)
tym301.set(7,_301id0)
tym301.set(6,_301id0)
tym301.set(5,_301id0);
const idm362: Map<number, (L:Lexer)=>void> = new Map()
idm362.set(24,_362id0)
idm362.set(25,_362id0)
idm362.set(50,_33id2);
const idm373: Map<number, (L:Lexer)=>void> = new Map()
idm373.set(24,_373id0)
idm373.set(25,_373id0)
idm373.set(50,_33id2);
const idm307r: Map<number, (L:Lexer)=>void> = new Map()
idm307r.set(24,_307id0)
idm307r.set(25,_307id0)
idm307r.set(50,_307id0)
idm307r.set(32,_307id0)
idm307r.set(21,_307id0)
idm307r.set(22,_307id0)
idm307r.set(48,_307id0)
idm307r.set(49,_307id0);
const tym307r: Map<number, (L:Lexer)=>void> = new Map()
tym307r.set(0,_307id0);
const idm306: Map<number, (L:Lexer)=>void> = new Map()
idm306.set(30,_306id0)
idm306.set(48,_306id0)
idm306.set(49,_306id0)
idm306.set(28,_306id0)
idm306.set(58,_306id0)
idm306.set(59,_306id0)
idm306.set(76,_306id0)
idm306.set(77,_306id0)
idm306.set(60,_306id0)
idm306.set(61,_306id0)
idm306.set(62,_306id0)
idm306.set(56,_306id0)
idm306.set(57,_306id0)
idm306.set(23,_306id0)
idm306.set(55,_306id0);
const tym306: Map<number, (L:Lexer)=>void> = new Map()
tym306.set(3,_306id0)
tym306.set(7,_306id0)
tym306.set(6,_306id0)
tym306.set(5,_306id0);
const idm377r: Map<number, (L:Lexer)=>void> = new Map()
idm377r.set(24,_377id0)
idm377r.set(25,_377id0)
idm377r.set(50,_377id0)
idm377r.set(32,_377id0)
idm377r.set(21,_377id0)
idm377r.set(22,_377id0)
idm377r.set(48,_377id0)
idm377r.set(49,_377id0);
const tym377r: Map<number, (L:Lexer)=>void> = new Map()
tym377r.set(0,_377id0);
const idm40: Map<number, (L:Lexer)=>void> = new Map()
idm40.set(58,_40id0)
idm40.set(59,_40id0)
idm40.set(60,_40id0)
idm40.set(61,_40id0)
idm40.set(62,_40id0);
const tym40: Map<number, (L:Lexer)=>void> = new Map()
tym40.set(6,_40id0)
tym40.set(3,_40id0)
tym40.set(5,_40id0)
tym40.set(7,_40id0);
const idm42r: Map<number, (L:Lexer)=>void> = new Map()
idm42r.set(58,_42id0)
idm42r.set(59,_42id0)
idm42r.set(60,_42id0)
idm42r.set(61,_42id0)
idm42r.set(62,_42id0);
const tym42r: Map<number, (L:Lexer)=>void> = new Map()
tym42r.set(6,_42id0)
tym42r.set(3,_42id0)
tym42r.set(5,_42id0)
tym42r.set(7,_42id0)
tym42r.set(4,_42id0)
tym42r.set(0,_42id0);
const idm203r: Map<number, (L:Lexer)=>void> = new Map()
idm203r.set(58,_203id0)
idm203r.set(59,_203id0)
idm203r.set(60,_203id0)
idm203r.set(61,_203id0)
idm203r.set(62,_203id0);
const tym203r: Map<number, (L:Lexer)=>void> = new Map()
tym203r.set(6,_203id0)
tym203r.set(3,_203id0)
tym203r.set(5,_203id0)
tym203r.set(7,_203id0)
tym203r.set(4,_203id0)
tym203r.set(0,_203id0);
const idm234r: Map<number, (L:Lexer)=>void> = new Map()
idm234r.set(24,_234id0)
idm234r.set(25,_234id0)
idm234r.set(50,_234id0)
idm234r.set(32,_234id0)
idm234r.set(21,_234id0)
idm234r.set(22,_234id0)
idm234r.set(48,_234id0)
idm234r.set(49,_234id0);
const tym234r: Map<number, (L:Lexer)=>void> = new Map()
tym234r.set(0,_234id0);
const idm98: Map<number, (L:Lexer)=>void> = new Map()
idm98.set(58,_98id0)
idm98.set(59,_98id0)
idm98.set(60,_98id0)
idm98.set(61,_98id0)
idm98.set(62,_98id0)
idm98.set(55,_98id0)
idm98.set(39,_98id6)
idm98.set(23,_98id7);
const tym98: Map<number, (L:Lexer)=>void> = new Map()
tym98.set(3,_98id0)
tym98.set(2,_98id0)
tym98.set(1,_98id0)
tym98.set(6,_98id0)
tym98.set(5,_98id0)
tym98.set(7,_98id0);
const idm102r: Map<number, (L:Lexer)=>void> = new Map()
idm102r.set(40,_102id0)
idm102r.set(58,_102id0)
idm102r.set(59,_102id0)
idm102r.set(60,_102id0)
idm102r.set(61,_102id0)
idm102r.set(62,_102id0)
idm102r.set(55,_102id0)
idm102r.set(39,_102id0);
const tym102r: Map<number, (L:Lexer)=>void> = new Map()
tym102r.set(3,_102id0)
tym102r.set(2,_102id0)
tym102r.set(1,_102id0)
tym102r.set(6,_102id0)
tym102r.set(5,_102id0)
tym102r.set(7,_102id0);
const idm101: Map<number, (L:Lexer)=>void> = new Map()
idm101.set(58,_98id0)
idm101.set(59,_98id0)
idm101.set(60,_98id0)
idm101.set(61,_98id0)
idm101.set(62,_98id0)
idm101.set(55,_98id0)
idm101.set(39,_98id6);
const idm258r: Map<number, (L:Lexer)=>void> = new Map()
idm258r.set(40,_258id0)
idm258r.set(58,_258id0)
idm258r.set(59,_258id0)
idm258r.set(60,_258id0)
idm258r.set(61,_258id0)
idm258r.set(62,_258id0)
idm258r.set(55,_258id0)
idm258r.set(39,_258id0);
const tym258r: Map<number, (L:Lexer)=>void> = new Map()
tym258r.set(3,_258id0)
tym258r.set(2,_258id0)
tym258r.set(1,_258id0)
tym258r.set(6,_258id0)
tym258r.set(5,_258id0)
tym258r.set(7,_258id0);
const tym61r: Map<number, (L:Lexer)=>void> = new Map()
tym61r.set(4,_61ty0)
tym61r.set(6,_61ty0)
tym61r.set(5,_61ty0)
tym61r.set(3,_61ty0)
tym61r.set(2,_61ty0)
tym61r.set(1,_61ty0)
tym61r.set(7,_61ty0)
tym61r.set(0,_61ty0);
const tym219r: Map<number, (L:Lexer)=>void> = new Map()
tym219r.set(4,_219ty0)
tym219r.set(6,_219ty0)
tym219r.set(5,_219ty0)
tym219r.set(3,_219ty0)
tym219r.set(2,_219ty0)
tym219r.set(1,_219ty0)
tym219r.set(7,_219ty0)
tym219r.set(0,_219ty0);
const idm118r: Map<number, (L:Lexer)=>void> = new Map()
idm118r.set(55,_118id0)
idm118r.set(58,_118id0)
idm118r.set(59,_118id0)
idm118r.set(60,_118id0)
idm118r.set(61,_118id0)
idm118r.set(62,_118id0)
idm118r.set(32,_118id0)
idm118r.set(56,_118id0)
idm118r.set(57,_118id0)
idm118r.set(54,_118id0)
idm118r.set(51,_118id0)
idm118r.set(52,_118id0)
idm118r.set(48,_118id0)
idm118r.set(49,_118id0)
idm118r.set(30,_118id0)
idm118r.set(76,_118id0)
idm118r.set(77,_118id0)
idm118r.set(29,_118id0)
idm118r.set(24,_118id0)
idm118r.set(25,_118id0)
idm118r.set(50,_118id0)
idm118r.set(21,_118id0)
idm118r.set(22,_118id0)
idm118r.set(40,_118id0)
idm118r.set(39,_118id0);
const tym118r: Map<number, (L:Lexer)=>void> = new Map()
tym118r.set(6,_118id0)
tym118r.set(3,_118id0)
tym118r.set(5,_118id0)
tym118r.set(7,_118id0)
tym118r.set(1,_118id0)
tym118r.set(4,_118id0)
tym118r.set(2,_118id0);
const idm259r: Map<number, (L:Lexer)=>void> = new Map()
idm259r.set(55,_259id0)
idm259r.set(58,_259id0)
idm259r.set(59,_259id0)
idm259r.set(60,_259id0)
idm259r.set(61,_259id0)
idm259r.set(62,_259id0)
idm259r.set(32,_259id0)
idm259r.set(56,_259id0)
idm259r.set(57,_259id0)
idm259r.set(54,_259id0)
idm259r.set(51,_259id0)
idm259r.set(52,_259id0)
idm259r.set(48,_259id0)
idm259r.set(49,_259id0)
idm259r.set(30,_259id0)
idm259r.set(76,_259id0)
idm259r.set(77,_259id0)
idm259r.set(29,_259id0)
idm259r.set(24,_259id0)
idm259r.set(25,_259id0)
idm259r.set(50,_259id0)
idm259r.set(21,_259id0)
idm259r.set(22,_259id0)
idm259r.set(40,_259id0)
idm259r.set(39,_259id0);
const tym259r: Map<number, (L:Lexer)=>void> = new Map()
tym259r.set(6,_259id0)
tym259r.set(3,_259id0)
tym259r.set(5,_259id0)
tym259r.set(7,_259id0)
tym259r.set(1,_259id0)
tym259r.set(4,_259id0)
tym259r.set(2,_259id0);
const idm227: Map<number, (L:Lexer)=>void> = new Map()
idm227.set(76,_227id0)
idm227.set(77,_227id1);
const tym227: Map<number, (L:Lexer)=>void> = new Map()
tym227.set(3,_227ty0)
tym227.set(7,_227ty1);
const idm197r: Map<number, (L:Lexer)=>void> = new Map()
idm197r.set(53,_197id0)
idm197r.set(76,_197id0)
idm197r.set(77,_197id0)
idm197r.set(38,_197id0)
idm197r.set(39,_197id0)
idm197r.set(26,_197id0)
idm197r.set(27,_197id0)
idm197r.set(58,_197id0)
idm197r.set(59,_197id0)
idm197r.set(60,_197id0)
idm197r.set(61,_197id0)
idm197r.set(62,_197id0)
idm197r.set(32,_197id0)
idm197r.set(56,_197id0)
idm197r.set(57,_197id0)
idm197r.set(54,_197id0)
idm197r.set(51,_197id0)
idm197r.set(52,_197id0)
idm197r.set(48,_197id0)
idm197r.set(49,_197id0)
idm197r.set(30,_197id0)
idm197r.set(29,_197id0)
idm197r.set(24,_197id0)
idm197r.set(25,_197id0)
idm197r.set(50,_197id0)
idm197r.set(21,_197id0)
idm197r.set(22,_197id0)
idm197r.set(40,_197id0);
const tym197r: Map<number, (L:Lexer)=>void> = new Map()
tym197r.set(3,_197id0)
tym197r.set(7,_197id0)
tym197r.set(2,_197id0)
tym197r.set(6,_197id0)
tym197r.set(6,_197id0)
tym197r.set(6,_197id0)
tym197r.set(6,_197id0)
tym197r.set(5,_197id0)
tym197r.set(4,_197id0)
tym197r.set(0,_197id0)
tym197r.set(1,_197id0)
tym197r.set(6,_197id0)
tym197r.set(6,_197id0);
const idm228: Map<number, (L:Lexer)=>void> = new Map()
idm228.set(76,_228id0)
idm228.set(77,_228id1);
const tym228: Map<number, (L:Lexer)=>void> = new Map()
tym228.set(3,_228ty0)
tym228.set(7,_228ty1)
tym228.set(2,_228ty2)
tym228.set(6,_228ty3)
tym228.set(6,_228ty4)
tym228.set(6,_228ty5);
const idm267r: Map<number, (L:Lexer)=>void> = new Map()
idm267r.set(76,_267id0)
idm267r.set(77,_267id0)
idm267r.set(53,_267id0)
idm267r.set(38,_267id0)
idm267r.set(39,_267id0)
idm267r.set(26,_267id0)
idm267r.set(27,_267id0)
idm267r.set(58,_267id0)
idm267r.set(59,_267id0)
idm267r.set(60,_267id0)
idm267r.set(61,_267id0)
idm267r.set(62,_267id0)
idm267r.set(32,_267id0)
idm267r.set(56,_267id0)
idm267r.set(57,_267id0)
idm267r.set(54,_267id0)
idm267r.set(51,_267id0)
idm267r.set(52,_267id0)
idm267r.set(48,_267id0)
idm267r.set(49,_267id0)
idm267r.set(30,_267id0)
idm267r.set(29,_267id0)
idm267r.set(24,_267id0)
idm267r.set(25,_267id0)
idm267r.set(50,_267id0)
idm267r.set(21,_267id0)
idm267r.set(22,_267id0)
idm267r.set(40,_267id0);
const tym267r: Map<number, (L:Lexer)=>void> = new Map()
tym267r.set(3,_267id0)
tym267r.set(7,_267id0)
tym267r.set(2,_267id0)
tym267r.set(6,_267id0)
tym267r.set(6,_267id0)
tym267r.set(6,_267id0)
tym267r.set(6,_267id0)
tym267r.set(6,_267id0)
tym267r.set(0,_267id0)
tym267r.set(6,_267id0)
tym267r.set(5,_267id0)
tym267r.set(4,_267id0)
tym267r.set(1,_267id0);
const idm346: Map<number, (L:Lexer)=>void> = new Map()
idm346.set(30,_346id0)
idm346.set(48,_346id1)
idm346.set(49,_346id1)
idm346.set(58,_346id3)
idm346.set(59,_346id3)
idm346.set(76,_346id3)
idm346.set(77,_346id3)
idm346.set(60,_346id3)
idm346.set(61,_346id3)
idm346.set(62,_346id3)
idm346.set(56,_346id3)
idm346.set(57,_346id3)
idm346.set(28,_346id12);
const tym346: Map<number, (L:Lexer)=>void> = new Map()
tym346.set(3,_346id3)
tym346.set(7,_346id3)
tym346.set(6,_346id3)
tym346.set(5,_346id3);
const idm244: Map<number, (L:Lexer)=>void> = new Map()
idm244.set(30,_244id0)
idm244.set(48,_244id0)
idm244.set(49,_244id0)
idm244.set(28,_244id0)
idm244.set(58,_244id0)
idm244.set(59,_244id0)
idm244.set(76,_244id0)
idm244.set(77,_244id0)
idm244.set(60,_244id0)
idm244.set(61,_244id0)
idm244.set(62,_244id0)
idm244.set(56,_244id0)
idm244.set(57,_244id0);
const tym244: Map<number, (L:Lexer)=>void> = new Map()
tym244.set(3,_244id0)
tym244.set(7,_244id0)
tym244.set(6,_244id0)
tym244.set(5,_244id0);
const idm245: Map<number, (L:Lexer)=>void> = new Map()
idm245.set(51,_245id0)
idm245.set(52,_245id0)
idm245.set(54,_245id2);
const idm245r: Map<number, (L:Lexer)=>void> = new Map()
idm245r.set(48,const_7_)
idm245r.set(49,const_7_)
idm245r.set(30,const_7_)
idm245r.set(58,const_7_)
idm245r.set(59,const_7_)
idm245r.set(76,const_7_)
idm245r.set(77,const_7_)
idm245r.set(60,const_7_)
idm245r.set(61,const_7_)
idm245r.set(62,const_7_)
idm245r.set(56,const_7_)
idm245r.set(57,const_7_)
idm245r.set(24,const_7_)
idm245r.set(25,const_7_)
idm245r.set(50,const_7_)
idm245r.set(32,const_7_)
idm245r.set(21,const_7_)
idm245r.set(22,const_7_)
idm245r.set(29,const_7_);
const tym245r: Map<number, (L:Lexer)=>void> = new Map()
tym245r.set(3,const_7_)
tym245r.set(7,const_7_)
tym245r.set(6,const_7_)
tym245r.set(5,const_7_)
tym245r.set(0,const_7_);
const idm347: Map<number, (L:Lexer)=>void> = new Map()
idm347.set(48,_346id1)
idm347.set(49,_346id1)
idm347.set(30,_346id0)
idm347.set(58,_346id3)
idm347.set(59,_346id3)
idm347.set(76,_346id3)
idm347.set(77,_346id3)
idm347.set(60,_346id3)
idm347.set(61,_346id3)
idm347.set(62,_346id3)
idm347.set(56,_346id3)
idm347.set(57,_346id3);
const idm348: Map<number, (L:Lexer)=>void> = new Map()
idm348.set(48,_346id1)
idm348.set(49,_346id1)
idm348.set(30,_346id0)
idm348.set(58,_346id3)
idm348.set(59,_346id3)
idm348.set(76,_346id3)
idm348.set(77,_346id3)
idm348.set(60,_346id3)
idm348.set(61,_346id3)
idm348.set(62,_346id3)
idm348.set(56,_346id3)
idm348.set(57,_346id3)
idm348.set(29,_348id12);
const idm311r: Map<number, (L:Lexer)=>void> = new Map()
idm311r.set(58,_311id0)
idm311r.set(54,_311id0)
idm311r.set(51,_311id0)
idm311r.set(52,_311id0)
idm311r.set(59,_311id0)
idm311r.set(76,_311id0)
idm311r.set(77,_311id0)
idm311r.set(60,_311id0)
idm311r.set(61,_311id0)
idm311r.set(62,_311id0)
idm311r.set(56,_311id0)
idm311r.set(57,_311id0)
idm311r.set(30,_311id0)
idm311r.set(48,_311id0)
idm311r.set(49,_311id0)
idm311r.set(24,_311id0)
idm311r.set(25,_311id0)
idm311r.set(50,_311id0)
idm311r.set(32,_311id0)
idm311r.set(21,_311id0)
idm311r.set(22,_311id0)
idm311r.set(29,_311id0);
const tym311r: Map<number, (L:Lexer)=>void> = new Map()
tym311r.set(3,_311id0)
tym311r.set(7,_311id0)
tym311r.set(6,_311id0)
tym311r.set(5,_311id0)
tym311r.set(0,_311id0);
const idm312: Map<number, (L:Lexer)=>void> = new Map()
idm312.set(58,_312id0)
idm312.set(59,_312id0)
idm312.set(60,_312id0)
idm312.set(61,_312id0)
idm312.set(62,_312id0)
idm312.set(56,_312id0)
idm312.set(57,_312id0)
idm312.set(32,_312id7);
const idm344r: Map<number, (L:Lexer)=>void> = new Map()
idm344r.set(48,_344id0)
idm344r.set(49,_344id0)
idm344r.set(30,_344id0)
idm344r.set(58,_344id0)
idm344r.set(59,_344id0)
idm344r.set(76,_344id0)
idm344r.set(77,_344id0)
idm344r.set(60,_344id0)
idm344r.set(61,_344id0)
idm344r.set(62,_344id0)
idm344r.set(56,_344id0)
idm344r.set(57,_344id0)
idm344r.set(24,_344id0)
idm344r.set(25,_344id0)
idm344r.set(50,_344id0)
idm344r.set(32,_344id0)
idm344r.set(21,_344id0)
idm344r.set(22,_344id0)
idm344r.set(29,_344id0);
const tym344r: Map<number, (L:Lexer)=>void> = new Map()
tym344r.set(3,_344id0)
tym344r.set(7,_344id0)
tym344r.set(6,_344id0)
tym344r.set(5,_344id0)
tym344r.set(0,_344id0);
const idm393r: Map<number, (L:Lexer)=>void> = new Map()
idm393r.set(48,_393id0)
idm393r.set(49,_393id0)
idm393r.set(30,_393id0)
idm393r.set(58,_393id0)
idm393r.set(59,_393id0)
idm393r.set(76,_393id0)
idm393r.set(77,_393id0)
idm393r.set(60,_393id0)
idm393r.set(61,_393id0)
idm393r.set(62,_393id0)
idm393r.set(56,_393id0)
idm393r.set(57,_393id0)
idm393r.set(24,_393id0)
idm393r.set(25,_393id0)
idm393r.set(50,_393id0)
idm393r.set(32,_393id0)
idm393r.set(21,_393id0)
idm393r.set(22,_393id0)
idm393r.set(29,_393id0);
const tym393r: Map<number, (L:Lexer)=>void> = new Map()
tym393r.set(3,_393id0)
tym393r.set(7,_393id0)
tym393r.set(6,_393id0)
tym393r.set(5,_393id0)
tym393r.set(0,_393id0);
const idm353r: Map<number, (L:Lexer)=>void> = new Map()
idm353r.set(58,_353id0)
idm353r.set(54,_353id0)
idm353r.set(51,_353id0)
idm353r.set(52,_353id0)
idm353r.set(59,_353id0)
idm353r.set(76,_353id0)
idm353r.set(77,_353id0)
idm353r.set(60,_353id0)
idm353r.set(61,_353id0)
idm353r.set(62,_353id0)
idm353r.set(56,_353id0)
idm353r.set(57,_353id0)
idm353r.set(30,_353id0)
idm353r.set(48,_353id0)
idm353r.set(49,_353id0)
idm353r.set(24,_353id0)
idm353r.set(25,_353id0)
idm353r.set(50,_353id0)
idm353r.set(32,_353id0)
idm353r.set(21,_353id0)
idm353r.set(22,_353id0)
idm353r.set(29,_353id0);
const tym353r: Map<number, (L:Lexer)=>void> = new Map()
tym353r.set(3,_353id0)
tym353r.set(7,_353id0)
tym353r.set(6,_353id0)
tym353r.set(5,_353id0)
tym353r.set(0,_353id0);
const idm376r: Map<number, (L:Lexer)=>void> = new Map()
idm376r.set(58,_376id0)
idm376r.set(54,_376id0)
idm376r.set(51,_376id0)
idm376r.set(52,_376id0)
idm376r.set(59,_376id0)
idm376r.set(76,_376id0)
idm376r.set(77,_376id0)
idm376r.set(60,_376id0)
idm376r.set(61,_376id0)
idm376r.set(62,_376id0)
idm376r.set(56,_376id0)
idm376r.set(57,_376id0)
idm376r.set(30,_376id0)
idm376r.set(48,_376id0)
idm376r.set(49,_376id0)
idm376r.set(24,_376id0)
idm376r.set(25,_376id0)
idm376r.set(50,_376id0)
idm376r.set(32,_376id0)
idm376r.set(21,_376id0)
idm376r.set(22,_376id0)
idm376r.set(29,_376id0);
const tym376r: Map<number, (L:Lexer)=>void> = new Map()
tym376r.set(3,_376id0)
tym376r.set(7,_376id0)
tym376r.set(6,_376id0)
tym376r.set(5,_376id0)
tym376r.set(0,_376id0);
const idm317: Map<number, (L:Lexer)=>void> = new Map()
idm317.set(58,_317id0)
idm317.set(59,_317id0)
idm317.set(76,_317id2)
idm317.set(77,_317id2)
idm317.set(60,_317id4)
idm317.set(61,_317id4)
idm317.set(62,_317id6)
idm317.set(56,_317id7)
idm317.set(57,_317id7)
idm317.set(30,_317id9);
const tym317: Map<number, (L:Lexer)=>void> = new Map()
tym317.set(3,_317id2)
tym317.set(7,_317id2)
tym317.set(6,_317ty2)
tym317.set(5,_317ty3);
const idm253r: Map<number, (L:Lexer)=>void> = new Map()
idm253r.set(58,_253id0)
idm253r.set(54,_253id0)
idm253r.set(51,_253id0)
idm253r.set(52,_253id0)
idm253r.set(59,_253id0)
idm253r.set(76,_253id0)
idm253r.set(77,_253id0)
idm253r.set(60,_253id0)
idm253r.set(61,_253id0)
idm253r.set(62,_253id0)
idm253r.set(56,_253id0)
idm253r.set(57,_253id0)
idm253r.set(30,_253id0)
idm253r.set(48,_253id0)
idm253r.set(49,_253id0)
idm253r.set(24,_253id0)
idm253r.set(25,_253id0)
idm253r.set(50,_253id0)
idm253r.set(32,_253id0)
idm253r.set(21,_253id0)
idm253r.set(22,_253id0)
idm253r.set(29,_253id0);
const tym253r: Map<number, (L:Lexer)=>void> = new Map()
tym253r.set(3,_253id0)
tym253r.set(7,_253id0)
tym253r.set(6,_253id0)
tym253r.set(5,_253id0)
tym253r.set(0,_253id0);
const idm249r: Map<number, (L:Lexer)=>void> = new Map()
idm249r.set(58,_249id0)
idm249r.set(54,_249id0)
idm249r.set(51,_249id0)
idm249r.set(52,_249id0)
idm249r.set(59,_249id0)
idm249r.set(76,_249id0)
idm249r.set(77,_249id0)
idm249r.set(60,_249id0)
idm249r.set(61,_249id0)
idm249r.set(62,_249id0)
idm249r.set(56,_249id0)
idm249r.set(57,_249id0)
idm249r.set(30,_249id0)
idm249r.set(48,_249id0)
idm249r.set(49,_249id0)
idm249r.set(24,_249id0)
idm249r.set(25,_249id0)
idm249r.set(50,_249id0)
idm249r.set(32,_249id0)
idm249r.set(21,_249id0)
idm249r.set(22,_249id0)
idm249r.set(29,_249id0);
const tym249r: Map<number, (L:Lexer)=>void> = new Map()
tym249r.set(3,_249id0)
tym249r.set(7,_249id0)
tym249r.set(6,_249id0)
tym249r.set(5,_249id0)
tym249r.set(0,_249id0);
const idm239: Map<number, (L:Lexer)=>void> = new Map()
idm239.set(48,_239id0)
idm239.set(49,_239id0)
idm239.set(30,_346id0)
idm239.set(58,_346id3)
idm239.set(59,_346id3)
idm239.set(76,_346id3)
idm239.set(77,_346id3)
idm239.set(60,_346id3)
idm239.set(61,_346id3)
idm239.set(62,_346id3)
idm239.set(56,_346id3)
idm239.set(57,_346id3);
const idm239r: Map<number, (L:Lexer)=>void> = new Map()
idm239r.set(48,const_9_)
idm239r.set(49,const_9_)
idm239r.set(24,const_9_)
idm239r.set(25,const_9_)
idm239r.set(50,const_9_)
idm239r.set(32,const_9_)
idm239r.set(21,const_9_)
idm239r.set(22,const_9_);
const tym239r: Map<number, (L:Lexer)=>void> = new Map()
tym239r.set(0,const_9_);
const idm237r: Map<number, (L:Lexer)=>void> = new Map()
idm237r.set(24,_237id0)
idm237r.set(25,_237id0)
idm237r.set(50,_237id0)
idm237r.set(32,_237id0)
idm237r.set(21,_237id0)
idm237r.set(22,_237id0)
idm237r.set(48,_237id0)
idm237r.set(49,_237id0);
const tym237r: Map<number, (L:Lexer)=>void> = new Map()
tym237r.set(0,_237id0);
const idm333: Map<number, (L:Lexer)=>void> = new Map()
idm333.set(24,_362id0)
idm333.set(25,_362id0)
idm333.set(50,_33id2)
idm333.set(32,_333id3);
const idm341r: Map<number, (L:Lexer)=>void> = new Map()
idm341r.set(24,_341id0)
idm341r.set(25,_341id0)
idm341r.set(50,_341id0)
idm341r.set(32,_341id0)
idm341r.set(21,_341id0)
idm341r.set(22,_341id0)
idm341r.set(48,_341id0)
idm341r.set(49,_341id0);
const tym341r: Map<number, (L:Lexer)=>void> = new Map()
tym341r.set(0,_341id0);
const idm365r: Map<number, (L:Lexer)=>void> = new Map()
idm365r.set(58,_365id0)
idm365r.set(54,_365id0)
idm365r.set(51,_365id0)
idm365r.set(52,_365id0)
idm365r.set(59,_365id0)
idm365r.set(76,_365id0)
idm365r.set(77,_365id0)
idm365r.set(60,_365id0)
idm365r.set(61,_365id0)
idm365r.set(62,_365id0)
idm365r.set(56,_365id0)
idm365r.set(57,_365id0)
idm365r.set(30,_365id0)
idm365r.set(48,_365id0)
idm365r.set(49,_365id0)
idm365r.set(24,_365id0)
idm365r.set(25,_365id0)
idm365r.set(50,_365id0)
idm365r.set(32,_365id0)
idm365r.set(21,_365id0)
idm365r.set(22,_365id0)
idm365r.set(29,_365id0);
const tym365r: Map<number, (L:Lexer)=>void> = new Map()
tym365r.set(3,_365id0)
tym365r.set(7,_365id0)
tym365r.set(6,_365id0)
tym365r.set(5,_365id0)
tym365r.set(0,_365id0);
const idm71r: Map<number, (L:Lexer)=>void> = new Map()
idm71r.set(32,_71id0)
idm71r.set(58,_71id0)
idm71r.set(59,_71id0)
idm71r.set(60,_71id0)
idm71r.set(61,_71id0)
idm71r.set(62,_71id0)
idm71r.set(56,_71id0)
idm71r.set(57,_71id0);
const tym71r: Map<number, (L:Lexer)=>void> = new Map()
tym71r.set(0,_71id0);
const idm220r: Map<number, (L:Lexer)=>void> = new Map()
idm220r.set(32,_220id0)
idm220r.set(58,_220id0)
idm220r.set(59,_220id0)
idm220r.set(60,_220id0)
idm220r.set(61,_220id0)
idm220r.set(62,_220id0)
idm220r.set(56,_220id0)
idm220r.set(57,_220id0);
const tym220r: Map<number, (L:Lexer)=>void> = new Map()
tym220r.set(0,_220id0);
function $hydrocarbon(l:Lexer) :void{_skip(l, const__)
$head(l)
if(!FAILED){
setProduction(0)
add_reduce(1,1);
return;
}
fail(l);}
    function $head_group_02_100(l:Lexer) :void{_skip(l, const__)
$prd$productions(l)
if(!FAILED){
setProduction(1)

return;
}
fail(l);}
    function $head(l:Lexer) :void{_skip(l, const__)
if(l.id == 10||l.id == 50){
 $pre$preamble(l)
if(!FAILED){
$head_group_02_100(l)
if(!FAILED){
setProduction(2)
add_reduce(2,2);
return;
}
}
} else if(l.id == 21||l.id == 22||l.id == 23||l.id == 48||l.id == 49){
 $head_group_02_100(l)
if(!FAILED){
setProduction(2)
add_reduce(1,3);
return;
}
}
fail(l);}
    
    function $pre$preamble_clause(l:Lexer) :void{_skip(l, const__)
if(l.id == 10){
 const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
if(!FAILED &&  pk1.id == 13){
 $pre$ignore_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 11){
 $pre$symbols_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 12){
 $pre$precedence_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 15){
 $pre$name_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 16){
 $pre$ext_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 14){
 $pre$error_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
} else if(!FAILED &&  pk1.id == 17){
 $pre$import_preamble(l)
if(!FAILED){
setProduction(5)

return;
}
}
} else if(l.id == 50){
 $cm$comment(l)
if(!FAILED){
setProduction(5)

return;
}
}
fail(l);}
    
    function $pre$symbols_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 11);
if(!FAILED){
$pre$symbols_preamble_HC_listbody2_101(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(7)
add_reduce(4,6);
return;
}
}
}
}
fail(l);}
    function $pre$precedence_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 12);
if(!FAILED){
$sym$terminal_symbol(l)
if(!FAILED){
_with_skip(l, const_2_, 2);
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(8)
add_reduce(5,7);
return;
}
}
}
}
}
fail(l);}
    function $pre$ignore_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 13);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(9)
add_reduce(4,8);
return;
}
}
}
}
fail(l);}
    function $pre$error_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 14);
if(!FAILED){
$sym$ignore_symbols(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(10)
add_reduce(4,9);
return;
}
}
}
}
fail(l);}
    function $pre$name_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 15);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(11)
add_reduce(4,10);
return;
}
}
}
}
fail(l);}
    function $pre$ext_preamble(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 10);
if(!FAILED){
_with_skip(l, const__, 16);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(12)
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
setProduction(14)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(14)

return;
}
} else if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(14)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(14)

return;
}
}
fail(l);}
    
    
    function $pre$import_preamble_group_021_106(l:Lexer) :void{_skip(l, const__)
if(l.id == 19){
 _no_check(l);
if(!FAILED){
setProduction(17)

return;
}
} else if(l.id == 20){
 _no_check(l);
if(!FAILED){
setProduction(17)

return;
}
}
fail(l);}
    function $pre$import_preamble(l:Lexer) :void{_skip(l, const__)
_no_check(l);
_with_skip(l, const_0_, 17);
_skip(l, const_0_)
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
setProduction(18)
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
setProduction(18)
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
setProduction(21)
add_reduce(1,19);
return;
}
fail(l);}
    function $prd$production_group_010_101(l:Lexer) :void{_skip(l, const__)
if(l.id == 24){
 _no_check(l);
if(!FAILED){
setProduction(22)

return;
}
} else if(l.id == 25){
 _no_check(l);
if(!FAILED){
setProduction(22)

return;
}
}
fail(l);}
    function $prd$production_group_111_102(l:Lexer) :void{_skip(l, const__)
$prd$production_group_010_101(l)
if(!FAILED){
$fn$error_function(l)
if(!FAILED){
setProduction(23)
add_reduce(2,0);
return;
}
}
fail(l);}
    function $prd$production_group_013_103(l:Lexer) :void{_skip(l, const__)
$sym$imported_production_symbol(l)
if(!FAILED){
setProduction(24)
add_reduce(1,20);
return;
}
fail(l);}
    
    function $prd$production_start_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 26){
 _no_check(l);
if(!FAILED){
setProduction(26)

return;
}
} else if(l.id == 27){
 _no_check(l);
if(!FAILED){
setProduction(26)

return;
}
}
fail(l);}
    function $pb$production_bodies_group_04_100(l:Lexer) :void{_skip(l, const__)
if(l.id == 24){
 _no_check(l);
if(!FAILED){
setProduction(28)

return;
}
} else if(l.id == 25){
 _no_check(l);
if(!FAILED){
setProduction(28)

return;
}
}
fail(l);}
    
    function $pb$production_body(l:Lexer) :void{_skip(l, const__)
if(const_4_.includes(l.id)||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $pb$entries(l)
if(!FAILED){
setProduction(30)
add_reduce(1,29);
return;
}
} else if(l.id == 30){
 const pk1:Lexer =_pk( l.copy(), /* e.eh, */const__) ;
if(!FAILED &&  const_5_.includes(pk1.id)||pk1.ty == 2||pk1.ty == 3||pk1.ty == 5||pk1.ty == 6||pk1.ty == 7){
 $pb$entries(l)
if(!FAILED){
setProduction(30)
add_reduce(1,29);
return;
}
} else if(!FAILED &&  pk1.id == 31){
 $pb$force_fork(l)
if(!FAILED){
$pb$entries(l)
if(!FAILED){
setProduction(30)
add_reduce(2,28);
return;
}
}
}
}
fail(l);}
    function $pb$entries(l:Lexer) :void{_skip(l, const__)
if(const_1_.includes(l.id)||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $pb$body_entries(l)
_skip(l, const__)
if(l.id == 48||l.id == 49){
 $fn$reduce_function(l)
if(!FAILED){
setProduction(31)
add_reduce(2,30);
return;
}
} else {
 if(!FAILED){
setProduction(31)
add_reduce(1,33);
return;
}
}
} else if(l.id == 23){
 $sym$empty_symbol(l)
if(!FAILED){
setProduction(31)
add_reduce(1,31);
return;
}
} else if(l.id == 55){
 $sym$EOF_symbol(l)
if(!FAILED){
setProduction(31)
add_reduce(1,32);
return;
}
}
fail(l);}
    
    function $pb$force_fork(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 30);
if(!FAILED){
_with_skip(l, const__, 31);
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(33)
add_reduce(3,37);
return;
}
}
}
fail(l);}
    function $pb$condition_clause(l:Lexer) :void{_skip(l, const__)
_no_check(l);
_skip(l, const__)
if(l.id == 33){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(34)
add_reduce(4,38);
return;
}
}
}
} else if(l.id == 34){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(34)
add_reduce(4,39);
return;
}
}
}
} else if(l.id == 35){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(34)
add_reduce(4,40);
return;
}
}
}
} else if(l.id == 36){
 _no_check(l);
if(!FAILED){
$sym$condition_symbol_list(l)
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(34)
add_reduce(4,41);
return;
}
}
}
} else if(l.id == 37){
 _no_check(l);
if(!FAILED){
$sym$symbol(l)
if(!FAILED){
_with_skip(l, const__, 32);
if(!FAILED){
setProduction(34)
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
if(l.id == 38){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(35)
add_reduce(4,43);
return;
}
}
} else if(l.id == 39){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40);
if(!FAILED){
setProduction(35)
add_reduce(5,44);
return;
}
}
}
}
fail(l);}
    function $fn$error_function(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 41);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
_with_skip(l, const_0_, 39);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40);
if(!FAILED){
_with_skip(l, const_0_, 39);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40);
if(!FAILED){
setProduction(36)
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
if(l.id == 43){
 _no_check(l);
if(!FAILED){
setProduction(37)

return;
}
} else if(l.id == 44){
 _no_check(l);
if(!FAILED){
setProduction(37)

return;
}
} else if(l.id == 45){
 _no_check(l);
if(!FAILED){
setProduction(37)

return;
}
} else if(l.id == 46){
 _no_check(l);
if(!FAILED){
setProduction(37)

return;
}
}
fail(l);}
    function $fn$reduce_function(l:Lexer) :void{_skip(l, const__)
$fn$js_function_start_symbol(l)
$fn$reduce_function_group_07_100(l)
_skip(l, const__)
if(l.id == 39){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40);
if(!FAILED){
setProduction(38)
add_reduce(5,46);
return;
}
}
}
} else if(l.id == 38){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(38)
add_reduce(4,47);
return;
}
}
} else if(l.id == 47){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 27);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(38)
add_reduce(5,48);
return;
}
}
}
}
fail(l);}
    function $fn$function_clause(l:Lexer) :void{_skip(l, const__)
$fn$js_function_start_symbol(l)
_skip(l, const__)
if(l.id == 39){
 _no_check(l);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const__, 40);
if(!FAILED){
setProduction(39)
add_reduce(4,49);
return;
}
}
}
} else if(l.id == 38){
 _no_check(l);
if(!FAILED){
$sym$js_identifier(l)
if(!FAILED){
setProduction(39)
add_reduce(3,50);
return;
}
}
}
fail(l);}
    
    function $fn$js_primitive_group_035_101(l:Lexer) :void{_skip(l, const__)
if(l.id == 58||l.id == 59){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(41)

return;
}
} else if(l.id == 60||l.id == 61){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(41)

return;
}
} else if(l.id == 62){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(41)

return;
}
} else if(l.id == 55){
 $sym$EOF_symbol(l)
if(!FAILED){
setProduction(41)

return;
}
}
fail(l);}
    function $fn$js_primitive(l:Lexer) :void{_skip(l, const_0_)
if(l.id == 55||l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62){
 $fn$js_primitive_group_035_101(l)
if(!FAILED){
setProduction(42)
add_reduce(1,51);
return;
}
} else if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.ty == 2){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(42)

return;
}
}
fail(l);}
    function $fn$js_data_block(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const_0_, 39);
if(!FAILED){
$fn$js_data(l)
if(!FAILED){
_with_skip(l, const_0_, 40);
if(!FAILED){
setProduction(43)
add_reduce(3,52);
return;
}
}
}
fail(l);}
    function $fn$js_function_start_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 48){
 _no_check(l);
if(!FAILED){
setProduction(44)

return;
}
} else if(l.id == 49){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
setProduction(44)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $cm$comment(l:Lexer) :void{_skip(l, const__)
$cm$cm(l)
if(!FAILED){
setProduction(45)

return;
}
fail(l);}
    function $cm$cm(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const_0_, 50);
if(!FAILED){
$cm$comment_data(l)
if(!FAILED){
$cm$comment_delimiter(l)
if(!FAILED){
setProduction(46)
add_reduce(3,53);
return;
}
}
}
fail(l);}
    function $cm$comment_delimiter(l:Lexer) :void{_skip(l, const_2_)
_with_skip(l, const__, 4);
if(!FAILED){
setProduction(47)

return;
}
fail(l);}
    
    function $cm$comment_primitive(l:Lexer) :void{_skip(l, const_0_)
if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
} else if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
} else if(l.ty == 2){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(49)

return;
}
}
fail(l);}
    
    
    function $sym$lexer_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 58||l.id == 59){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(56)

return;
}
} else if(l.id == 60||l.id == 61){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(56)

return;
}
} else if(l.id == 62){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(56)

return;
}
} else if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){
 $sym$grouped_symbol(l)
if(!FAILED){
$sym$grouped_delimiter(l)
if(!FAILED){
setProduction(56)
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
setProduction(57)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(57)

return;
}
}
fail(l);}
    function $sym$grouped_symbol_group_013_103(l:Lexer) :void{_skip(l, const__)
if(l.ty == 6){
 _no_check(l);
if(!FAILED){
setProduction(58)

return;
}
} else if(l.ty == 3){
 _no_check(l);
if(!FAILED){
setProduction(58)

return;
}
} else if(l.ty == 5){
 _no_check(l);
if(!FAILED){
setProduction(58)

return;
}
} else if(l.ty == 7){
 _no_check(l);
if(!FAILED){
setProduction(58)

return;
}
}
fail(l);}
    
    function $sym$grouped_symbol(l:Lexer) :void{_skip(l, const__)
$sym$grouped_symbol_HC_listbody1_104(l)

if(l.id == 55||l.ty == 1||l.ty == 4){
 $sym$sym_delimter(l)
if(!FAILED){
setProduction(60)
add_reduce(2,54);
return;
}
} else {
 if(!FAILED){
setProduction(60)
add_reduce(1,54);
return;
}
}
fail(l);}
    function $sym$ignore_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 58||l.id == 59){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 60||l.id == 61){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
} else if(l.id == 62){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(61)

return;
}
}
fail(l);}
    function $sym$terminal_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 58||l.id == 59){
 $sym$generated_symbol(l)
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 60||l.id == 61){
 $sym$literal_symbol(l)
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 62){
 $sym$escaped_symbol(l)
if(!FAILED){
setProduction(62)

return;
}
} else if(l.id == 56||l.id == 57){
 $sym$assert_function_symbol(l)
if(!FAILED){
setProduction(62)

return;
}
}
fail(l);}
    function $sym$symbol_group_031_105(l:Lexer) :void{_skip(l, const__)
if(l.id == 51){
 _no_check(l);
if(!FAILED){
setProduction(63)

return;
}
} else if(l.id == 52){
 _no_check(l);
if(!FAILED){
setProduction(63)

return;
}
}
fail(l);}
    
    function $sym$EOF_symbol(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 0);
if(!FAILED){
setProduction(65)
add_reduce(1,58);
return;
}
fail(l);}
    function $sym$empty_symbol(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 23);
if(!FAILED){
setProduction(66)
add_reduce(1,59);
return;
}
fail(l);}
    function $sym$assert_function_symbol(l:Lexer) :void{_skip(l, const__)
if(l.id == 56){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(67)
add_reduce(3,60);
return;
}
}
}
} else if(l.id == 57){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(67)
add_reduce(3,61);
return;
}
}
}
}
fail(l);}
    function $sym$generated_symbol_group_140_106(l:Lexer) :void{_skip(l, const__)
if(l.id == 58){
 _no_check(l);
if(!FAILED){
setProduction(68)

return;
}
} else if(l.id == 59){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
setProduction(68)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$generated_symbol(l:Lexer) :void{_skip(l, const__)
$sym$generated_symbol_group_140_106(l)
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(69)
add_reduce(2,62);
return;
}
}
fail(l);}
    function $sym$literal_symbol_group_143_107(l:Lexer) :void{_skip(l, const__)
if(l.id == 60){
 _no_check(l);
if(!FAILED){
setProduction(70)

return;
}
} else if(l.id == 61){
 _no_check(l);
if(!FAILED){
_with_skip(l, const__, 42);
if(!FAILED){
setProduction(70)
add_reduce(2,0);
return;
}
}
}
fail(l);}
    function $sym$literal_symbol_group_045_108(l:Lexer) :void{_skip(l, const__)
if(l.id == 76||l.id == 77||l.ty == 3||l.ty == 7){
 $sym$identifier(l)
if(!FAILED){
setProduction(71)

return;
}
} else if(l.ty == 2){
 $def$natural(l)
if(!FAILED){
setProduction(71)

return;
}
}
fail(l);}
    function $sym$literal_symbol(l:Lexer) :void{_skip(l, const__)
$sym$literal_symbol_group_143_107(l)
$sym$literal_symbol_group_045_108(l)

if(l.id == 55||l.ty == 1||l.ty == 4){
 $sym$sym_delimter(l)
if(!FAILED){
setProduction(72)
add_reduce(3,63);
return;
}
} else {
 if(!FAILED){
setProduction(72)
add_reduce(2,63);
return;
}
}
fail(l);}
    
    function $sym$escaped_symbol(l:Lexer) :void{_skip(l, const__)
_no_check(l);
$sym$escaped_symbol_HC_listbody1_109(l)

if(l.id == 55||l.ty == 1||l.ty == 4){
 $sym$sym_delimter(l)
if(!FAILED){
setProduction(74)
add_reduce(3,64);
return;
}
} else {
 if(!FAILED){
setProduction(74)
add_reduce(2,64);
return;
}
}
fail(l);}
    function $sym$production_symbol(l:Lexer) :void{_skip(l, const__)
$sym$identifier(l)
if(!FAILED){
setProduction(75)
add_reduce(1,65);
return;
}
fail(l);}
    function $sym$imported_production_symbol(l:Lexer) :void{_skip(l, const__)
$sym$production_id(l)
if(!FAILED){
_with_skip(l, const__, 53);
if(!FAILED){
$sym$identifier(l)
if(!FAILED){
setProduction(76)
add_reduce(3,66);
return;
}
}
}
fail(l);}
    function $sym$production_id(l:Lexer) :void{_skip(l, const__)
$sym$identifier(l)
if(!FAILED){
setProduction(77)

return;
}
fail(l);}
    function $sym$identifier(l:Lexer) :void{_skip(l, const__)
$def$js_identifier(l)
if(!FAILED){
setProduction(78)

return;
}
fail(l);}
    function $sym$js_identifier(l:Lexer) :void{_skip(l, const__)
$def$id(l)
if(!FAILED){
setProduction(79)

return;
}
fail(l);}
    function $sym$sym_delimter(l:Lexer) :void{
if(l.id == 55){
 _no_check(l);
if(!FAILED){
setProduction(80)

return;
}
} else if(l.ty == 1){
 _no_check(l);
if(!FAILED){
setProduction(80)

return;
}
} else if(l.ty == 4){
 _no_check(l);
if(!FAILED){
setProduction(80)

return;
}
}
fail(l);}
    function $def$natural(l:Lexer) :void{_skip(l, const__)
_(l, 2);
if(!FAILED){
setProduction(92)

return;
}
fail(l);}
    function $def$id(l:Lexer) :void{_skip(l, const__)
_with_skip(l, const__, 3);
if(!FAILED){
setProduction(93)

return;
}
fail(l);}
    function $def$js_identifier(l:Lexer) :void{_skip(l, const__)
$def$js_id_symbols(l)
if(!FAILED){
setProduction(101)

return;
}
fail(l);}
    
    function $pre$preamble(l:Lexer):void{
_skip(l, const__)
if(l.id == 10||l.id == 50){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 5:
State2(l)
 break;
case 4:
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 23||l.ty == 0){ return;}
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
if(l.id == 10||l.id == 50){ 
             
            $pre$preamble_clause(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 5:
State143(l)
 break;
case 4: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State2(l:Lexer):void{
_skip(l, const__)
if(l.id == 10||l.id == 21||l.id == 22||l.id == 23||l.id == 50||l.ty == 0){ 
             
            completeProduction(5,1,4); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody4_105(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State19(l);
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 16:
_skip(l, const_0_)
if(l.id == 19||l.id == 20||l.ty == 0){ return;}
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
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State18(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State181(l);
             
            }
else fail(l);
}
    function State19(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 19||l.id == 20||l.ty == 0||l.ty == 1){ 
             
            completeProduction(5,1,16); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody2_102(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State22(l);
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 13:
_skip(l, const_0_)
if(l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State21(cp)
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
    function State21(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 1){ 
             
            _no_check(l);;stack_ptr++;State182(l);
             
            }
else fail(l);
}
    function State22(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(5,1,13); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $pre$import_preamble_HC_listbody1_104(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 15:
_skip(l, const_0_)
if(l.ty == 0||l.ty == 1){ return;}
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
case 14:
State25(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State24(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $pre$import_preamble_group_019_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 14:
State183(l)
 break;
case 15: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State25(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(13,1,15); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $prd$productions(l:Lexer):void{
_skip(l, const__)
if(idm30.has(l.id)){idm30.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 35:
State32(l)
 break;
case 25:
State31(l)
 break;
case 20:
_skip(l, const__)
if(l.ty == 0){ return;}
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
    function State31(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(15,1,20); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State32(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(16,1,20); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State33(l:Lexer):void{
_skip(l, const__)
if(idm33.has(l.id)){idm33.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State190(l)
 break;
case 35:
State191(l)
 break;
case 25:
State189(l)
 break;
case 20: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State34(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProductionPlain(1,20); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function State35(l:Lexer):void{
_skip(l, const__)
if(l.id == 76||l.id == 77||l.ty == 3||l.ty == 7){ 
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
case 24:
State209(l)
 break;
case 21:
State208(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State36(l:Lexer):void{
_skip(l, const__)
if(l.id == 76||l.id == 77||l.ty == 3||l.ty == 7){ 
             
            $prd$production_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 24:
State192(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pre$symbols_preamble_HC_listbody2_101(l:Lexer):void{
_skip(l, const_2_)
if(idm40.has(l.id)){idm40.get(l.id)(l); } else if(tym40.has(l.ty)){tym40.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 56:
State42(l)
 break;
case 6:
_skip(l, const_2_)
if(l.ty == 0||l.ty == 4){ return;}
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
    function State41(l:Lexer):void{
_skip(l, const_2_)
if(idm40.has(l.id)){idm40.get(l.id)(l); } else if(tym40.has(l.ty)){tym40.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 56:
State203(l)
 break;
case 6: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State42(l:Lexer):void{
_skip(l, const_2_)
if(idm42r.has(l.id)){idm42r.get(l.id)(l); return;} else if(tym42r.has(l.ty)){tym42r.get(l.ty)(l); return;}
else fail(l);
}
    function State55(l:Lexer):void{
if(l.id == 55||l.ty == 1||l.ty == 3||l.ty == 4||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(13,1,59); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $cm$comment_data(l:Lexer):void{
if(l.ty == 1||l.ty == 2||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 49:
State61(l)
 break;
case 48:
if(l.ty == 0||l.ty == 4){ return;}
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
    function State61(l:Lexer):void{
if(tym61r.has(l.ty)){tym61r.get(l.ty)(l); return;}
else fail(l);
}
    function State62(l:Lexer):void{
if(l.ty == 1||l.ty == 2||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $cm$comment_primitive(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 49:
State219(l)
 break;
case 48: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$condition_symbol_list(l:Lexer):void{
_skip(l, const__)
if(l.id == 56||l.id == 57||l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State71(l)
 break;
case 51:
_skip(l, const__)
if(l.id == 32||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State70(cp)
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
    function State70(l:Lexer):void{
_skip(l, const__)
if(l.id == 56||l.id == 57||l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62){ 
             
            $sym$terminal_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State220(l)
 break;
case 51: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State71(l:Lexer):void{
_skip(l, const__)
if(idm71r.has(l.id)){idm71r.get(l.id)(l); return;} else if(tym71r.has(l.ty)){tym71r.get(l.ty)(l); return;}
else fail(l);
}
    function $sym$ignore_symbols(l:Lexer):void{
_skip(l, const_2_)
if(l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61:
State86(l)
 break;
case 55:
_skip(l, const_2_)
if(l.ty == 0||l.ty == 4){ return;}
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
    function State85(l:Lexer):void{
_skip(l, const_2_)
if(l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62){ 
             
            $sym$ignore_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 61:
State229(l)
 break;
case 55: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State86(l:Lexer):void{
_skip(l, const_2_)
if(l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62||l.ty == 0||l.ty == 4){ 
             
            completeProduction(5,1,55); stack_ptr-=1;
             
            ;return}
else fail(l);
}
    function $sym$grouped_symbol_HC_listbody1_104(l:Lexer):void{
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 59:
if(l.id == 55||l.ty == 1||l.ty == 4){ return;}
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
case 58:
State55(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State91(l:Lexer):void{
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 58:
State214(l)
 break;
case 59: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $fn$js_data(l:Lexer):void{
_skip(l, const_0_)
if(idm98.has(l.id)){idm98.get(l.id)(l); } else if(tym98.has(l.ty)){tym98.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 43:
State100(l)
 break;
case 42:
State99(l)
 break;
case 40:
_skip(l, const_0_)
if(l.id == 40){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State101(cp)
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
    function State99(l:Lexer):void{
_skip(l, const_0_)
if(idm102r.has(l.id)){idm102r.get(l.id)(l); return;} else if(tym102r.has(l.ty)){tym102r.get(l.ty)(l); return;}
else fail(l);
}
    function State100(l:Lexer):void{
_skip(l, const_0_)
if(idm102r.has(l.id)){idm102r.get(l.id)(l); return;} else if(tym102r.has(l.ty)){tym102r.get(l.ty)(l); return;}
else fail(l);
}
    function State101(l:Lexer):void{
_skip(l, const_0_)
if(idm101.has(l.id)){idm101.get(l.id)(l); } else if(tym98.has(l.ty)){tym98.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 43:
State258(l)
 break;
case 42:
State257(l)
 break;
case 40: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State102(l:Lexer):void{
_skip(l, const_0_)
if(idm102r.has(l.id)){idm102r.get(l.id)(l); return;} else if(tym102r.has(l.ty)){tym102r.get(l.ty)(l); return;}
else fail(l);
}
    function $sym$escaped_symbol_HC_listbody1_109(l:Lexer):void{
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 73:
if(const_3_.includes(l.id)||l.ty == 1||l.ty == 2||l.ty == 4){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State117(cp)
                                if (FAILED) {
                                    prod = p;
                                    FAILED = false;
                                    stack_ptr = s;
                                    reset(m);
                                    return;
                                } else l.sync(cp);
                            }
 break;
case 58:
State118(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State117(l:Lexer):void{
if(l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            $sym$grouped_symbol_group_013_103(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 58:
State259(l)
 break;
case 73: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State118(l:Lexer):void{
if(idm118r.has(l.id)){idm118r.get(l.id)(l); return;} else if(tym118r.has(l.ty)){tym118r.get(l.ty)(l); return;}
else fail(l);
}
    function State143(l:Lexer):void{
_skip(l, const__)
if(l.id == 10||l.id == 21||l.id == 22||l.id == 23||l.id == 50||l.ty == 0){ 
             
            completeProduction(4,2,4); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State167(l:Lexer):void{
if(idm197r.has(l.id)){idm197r.get(l.id)(l); return;} else if(tym197r.has(l.ty)){tym197r.get(l.ty)(l); return;}
else fail(l);
}
    function State181(l:Lexer):void{
_skip(l, const_0_)
if(l.id == 19||l.id == 20||l.ty == 0||l.ty == 1){ 
             
            completeProduction(4,2,16); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State182(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(4,2,13); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State183(l:Lexer):void{
_skip(l, const_0_)
if(l.ty == 0||l.ty == 1||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(12,2,15); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State189(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(17,2,20); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State190(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(1,2,20); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State191(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(18,2,20); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State192(l:Lexer):void{
_skip(l, const__)
if(l.id == 26||l.id == 27){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 26:
State295(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State197(l:Lexer):void{
if(idm197r.has(l.id)){idm197r.get(l.id)(l); return;} else if(tym197r.has(l.ty)){tym197r.get(l.ty)(l); return;}
else fail(l);
}
    function State198(l:Lexer):void{
if(idm197r.has(l.id)){idm197r.get(l.id)(l); return;} else if(tym197r.has(l.ty)){tym197r.get(l.ty)(l); return;}
else fail(l);
}
    function State199(l:Lexer):void{
if(idm197r.has(l.id)){idm197r.get(l.id)(l); return;} else if(tym197r.has(l.ty)){tym197r.get(l.ty)(l); return;}
else fail(l);
}
    function State203(l:Lexer):void{
_skip(l, const_2_)
if(idm203r.has(l.id)){idm203r.get(l.id)(l); return;} else if(tym203r.has(l.ty)){tym203r.get(l.ty)(l); return;}
else fail(l);
}
    function State208(l:Lexer):void{
_skip(l, const__)
if(l.id == 26||l.id == 27){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 26:
State302(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State209(l:Lexer):void{
_skip(l, const__)
if(l.id == 26||l.id == 27){ 
             
            $prd$production_start_symbol(l); stack_ptr++;
             
            }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 26:
State301(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State214(l:Lexer):void{
if(l.id == 55||l.ty == 1||l.ty == 3||l.ty == 4||l.ty == 5||l.ty == 6||l.ty == 7){ 
             
            completeProduction(12,2,59); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function State219(l:Lexer):void{
if(tym219r.has(l.ty)){tym219r.get(l.ty)(l); return;}
else fail(l);
}
    function State220(l:Lexer):void{
_skip(l, const__)
if(idm220r.has(l.id)){idm220r.get(l.id)(l); return;} else if(tym220r.has(l.ty)){tym220r.get(l.ty)(l); return;}
else fail(l);
}
    function $def$js_id_symbols(l:Lexer):void{
if(idm227.has(l.id)){idm227.get(l.id)(l); } else if(tym227.has(l.ty)){tym227.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 102:
if(const_6_.includes(l.id)||l.ty == 1||l.ty == 4||l.ty == 5||l.ty == 6){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State228(cp)
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
    function State228(l:Lexer):void{
if(idm228.has(l.id)){idm228.get(l.id)(l); } else if(tym228.has(l.ty)){tym228.get(l.ty)(l); }
else fail(l);
}
    function State229(l:Lexer):void{
_skip(l, const_2_)
if(l.id == 58||l.id == 59||l.id == 60||l.id == 61||l.id == 62||l.ty == 0||l.ty == 4){ 
             
            completeProduction(4,2,55); stack_ptr-=2;
             
            ;return}
else fail(l);
}
    function $pb$production_bodies(l:Lexer):void{
_skip(l, const__)
if(idm306.has(l.id)){idm306.get(l.id)(l); } else if(tym306.has(l.ty)){tym306.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 30:
State234(l)
 break;
case 29:
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 32||l.id == 48||l.id == 49||l.ty == 0){ return;}
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
    function State234(l:Lexer):void{
_skip(l, const__)
if(idm234r.has(l.id)){idm234r.get(l.id)(l); return;} else if(tym234r.has(l.ty)){tym234r.get(l.ty)(l); return;}
else fail(l);
}
    function State235(l:Lexer):void{
_skip(l, const__)
if(idm362.has(l.id)){idm362.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State307(l)
 break;
case 28:
State306(l)
 break;
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State237(l:Lexer):void{
_skip(l, const__)
if(idm237r.has(l.id)){idm237r.get(l.id)(l); return;} else if(tym237r.has(l.ty)){tym237r.get(l.ty)(l); return;}
else fail(l);
}
    function State239(l:Lexer):void{
_skip(l, const__)
if(idm239.has(l.id)){idm239.get(l.id)(l); } else if(tym346.has(l.ty)){tym346.get(l.ty)(l); } else if(idm239r.has(l.id)){idm239r.get(l.id)(l); return;} else if(tym239r.has(l.ty)){tym239r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 64:
State344(l)
 break;
case 39:
State342(l)
 break;
case 38:
State341(l)
 break;
case 34:
State343(l)
 break;
case 31:
case 32: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State242(l:Lexer):void{
_skip(l, const__)
if(idm245r.has(l.id)){idm245r.get(l.id)(l); return;} else if(tym245r.has(l.ty)){tym245r.get(l.ty)(l); return;}
else fail(l);
}
    function State243(l:Lexer):void{
_skip(l, const__)
if(idm245r.has(l.id)){idm245r.get(l.id)(l); return;} else if(tym245r.has(l.ty)){tym245r.get(l.ty)(l); return;}
else fail(l);
}
    function State244(l:Lexer):void{
_skip(l, const__)
if(idm244.has(l.id)){idm244.get(l.id)(l); } else if(tym244.has(l.ty)){tym244.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 32:
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 24||l.id == 25||l.id == 32||l.id == 50||l.ty == 0){ return;}
State348(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State245(l:Lexer):void{
_skip(l, const__)
if(idm245.has(l.id)){idm245.get(l.id)(l); } else if(idm245r.has(l.id)){idm245r.get(l.id)(l); return;} else if(tym245r.has(l.ty)){tym245r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State312(l)
 break;
case 32:
case 64: return;
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
    function State257(l:Lexer):void{
_skip(l, const_0_)
if(idm258r.has(l.id)){idm258r.get(l.id)(l); return;} else if(tym258r.has(l.ty)){tym258r.get(l.ty)(l); return;}
else fail(l);
}
    function State258(l:Lexer):void{
_skip(l, const_0_)
if(idm258r.has(l.id)){idm258r.get(l.id)(l); return;} else if(tym258r.has(l.ty)){tym258r.get(l.ty)(l); return;}
else fail(l);
}
    function State259(l:Lexer):void{
if(idm259r.has(l.id)){idm259r.get(l.id)(l); return;} else if(tym259r.has(l.ty)){tym259r.get(l.ty)(l); return;}
else fail(l);
}
    function $prd$production(l:Lexer):void{
_skip(l, const__)
if(idm263.has(l.id)){idm263.get(l.id)(l); }
else fail(l);
}
    function State267(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State268(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State269(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State270(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State271(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State272(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State273(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State274(l:Lexer):void{
if(idm267r.has(l.id)){idm267r.get(l.id)(l); return;} else if(tym267r.has(l.ty)){tym267r.get(l.ty)(l); return;}
else fail(l);
}
    function State295(l:Lexer):void{
_skip(l, const__)
if(idm301.has(l.id)){idm301.get(l.id)(l); } else if(tym301.has(l.ty)){tym301.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29:
State355(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State301(l:Lexer):void{
_skip(l, const__)
if(idm301.has(l.id)){idm301.get(l.id)(l); } else if(tym301.has(l.ty)){tym301.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29:
State362(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State302(l:Lexer):void{
_skip(l, const__)
if(idm301.has(l.id)){idm301.get(l.id)(l); } else if(tym301.has(l.ty)){tym301.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 29:
State373(l)
 break;
case 25: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State306(l:Lexer):void{
_skip(l, const__)
if(idm306.has(l.id)){idm306.get(l.id)(l); } else if(tym306.has(l.ty)){tym306.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 30:
State377(l)
 break;
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State307(l:Lexer):void{
_skip(l, const__)
if(idm307r.has(l.id)){idm307r.get(l.id)(l); return;} else if(tym307r.has(l.ty)){tym307r.get(l.ty)(l); return;}
else fail(l);
}
    function State311(l:Lexer):void{
_skip(l, const__)
if(idm311r.has(l.id)){idm311r.get(l.id)(l); return;} else if(tym311r.has(l.ty)){tym311r.get(l.ty)(l); return;}
else fail(l);
}
    function State312(l:Lexer):void{
_skip(l, const__)
if(idm312.has(l.id)){idm312.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 62:
State352(l)
 break;
case 64: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $sym$symbol(l:Lexer):void{
_skip(l, const__)
if(idm317.has(l.id)){idm317.get(l.id)(l); } else if(tym317.has(l.ty)){tym317.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 76:
State249(l)
 break;
case 75:
State248(l)
 break;
case 74:
State251(l)
 break;
case 72:
State250(l)
 break;
case 69:
State247(l)
 break;
case 67:
State252(l)
 break;
case 64:
_skip(l, const__)
if(const_8_.includes(l.id)||l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State319(cp)
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
    function State318(l:Lexer):void{
_skip(l, const__)
if(idm301.has(l.id)){idm301.get(l.id)(l); } else if(tym301.has(l.ty)){tym301.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 64:
_skip(l, const__)
if(const_8_.includes(l.id)||l.ty == 0||l.ty == 3||l.ty == 5||l.ty == 6||l.ty == 7){ return;}
State245(l)
 break;
case 32:
State239(l)
 break;
case 31:
State237(l)
 break;
case 30:
State234(l)
 break;
case 29:
State333(l)
 break;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State319(l:Lexer):void{
_skip(l, const__)
if(idm245.has(l.id)){idm245.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State312(l)
 break;
case 64: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State333(l:Lexer):void{
_skip(l, const__)
if(idm333.has(l.id)){idm333.get(l.id)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State307(l)
 break;
case 28:
State306(l)
 break;
case 64:
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State341(l:Lexer):void{
_skip(l, const__)
if(idm341r.has(l.id)){idm341r.get(l.id)(l); return;} else if(tym341r.has(l.ty)){tym341r.get(l.ty)(l); return;}
else fail(l);
}
    function State342(l:Lexer):void{
_skip(l, const__)
if(idm344r.has(l.id)){idm344r.get(l.id)(l); return;} else if(tym344r.has(l.ty)){tym344r.get(l.ty)(l); return;}
else fail(l);
}
    function State343(l:Lexer):void{
_skip(l, const__)
if(idm344r.has(l.id)){idm344r.get(l.id)(l); return;} else if(tym344r.has(l.ty)){tym344r.get(l.ty)(l); return;}
else fail(l);
}
    function State344(l:Lexer):void{
_skip(l, const__)
if(idm245.has(l.id)){idm245.get(l.id)(l); } else if(idm344r.has(l.id)){idm344r.get(l.id)(l); return;} else if(tym344r.has(l.ty)){tym344r.get(l.ty)(l); return;}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 63:
State312(l)
 break;
case 32:
case 64: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function $pb$body_entries(l:Lexer):void{
_skip(l, const__)
if(idm346.has(l.id)){idm346.get(l.id)(l); } else if(tym346.has(l.ty)){tym346.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 64:
State245(l)
 break;
case 39:
State243(l)
 break;
case 34:
State242(l)
 break;
case 32:
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 24||l.id == 25||l.id == 29||l.id == 32||l.id == 50||l.ty == 0){ return;}
{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                                State347(cp)
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
    function State347(l:Lexer):void{
_skip(l, const__)
if(idm347.has(l.id)){idm347.get(l.id)(l); } else if(tym346.has(l.ty)){tym346.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 64:
State344(l)
 break;
case 39:
State342(l)
 break;
case 34:
State343(l)
 break;
case 32: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State348(l:Lexer):void{
_skip(l, const__)
if(idm348.has(l.id)){idm348.get(l.id)(l); } else if(tym346.has(l.ty)){tym346.get(l.ty)(l); }
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 64:
State344(l)
 break;
case 39:
State342(l)
 break;
case 34:
State343(l)
 break;
case 32: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State352(l:Lexer):void{
_skip(l, const__)
if(l.id == 32){ 
             
            _no_check(l);;stack_ptr++;State376(l);
             
            }
else fail(l);
}
    function State353(l:Lexer):void{
_skip(l, const__)
if(idm353r.has(l.id)){idm353r.get(l.id)(l); return;} else if(tym353r.has(l.ty)){tym353r.get(l.ty)(l); return;}
else fail(l);
}
    function State355(l:Lexer):void{
_skip(l, const__)
if(idm362.has(l.id)){idm362.get(l.id)(l); } else if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(23,4,25); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State307(l)
 break;
case 28:
State306(l)
 break;
case 25:
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State362(l:Lexer):void{
_skip(l, const__)
if(idm362.has(l.id)){idm362.get(l.id)(l); } else if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(22,4,25); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State307(l)
 break;
case 28:
State306(l)
 break;
case 25:
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State365(l:Lexer):void{
_skip(l, const__)
if(idm365r.has(l.id)){idm365r.get(l.id)(l); return;} else if(tym365r.has(l.ty)){tym365r.get(l.ty)(l); return;}
else fail(l);
}
    function State373(l:Lexer):void{
_skip(l, const__)
if(idm373.has(l.id)){idm373.get(l.id)(l); } else if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(24,4,25); stack_ptr-=4;
             
            ;return}
else fail(l);
const sp: u32 = stack_ptr;
while(sp <= stack_ptr){  
switch(prod) {
case 45:
State307(l)
 break;
case 28:
State306(l)
 break;
case 23:
State388(l)
 break;
case 25:
case 29: return;
default:fail(l);return}
if(prod>=0)stack_ptr++
}
}
    function State376(l:Lexer):void{
_skip(l, const__)
if(idm376r.has(l.id)){idm376r.get(l.id)(l); return;} else if(tym376r.has(l.ty)){tym376r.get(l.ty)(l); return;}
else fail(l);
}
    function State377(l:Lexer):void{
_skip(l, const__)
if(idm377r.has(l.id)){idm377r.get(l.id)(l); return;} else if(tym377r.has(l.ty)){tym377r.get(l.ty)(l); return;}
else fail(l);
}
    function State388(l:Lexer):void{
_skip(l, const__)
if(l.id == 21||l.id == 22||l.id == 48||l.id == 49||l.id == 50||l.ty == 0){ 
             
            completeProduction(21,5,25); stack_ptr-=5;
             
            ;return}
else fail(l);
}
    function State393(l:Lexer):void{
_skip(l, const__)
if(idm393r.has(l.id)){idm393r.get(l.id)(l); return;} else if(tym393r.has(l.ty)){tym393r.get(l.ty)(l); return;}
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