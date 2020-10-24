export default 

            var str: string = "", FAILED:boolean = false, prod:i32 = -1, stack_ptr:u32 = 0;

            
const TokenSpace:i32 = 1,
    TokenNumber:i32 = 2,
    TokenIdentifier:i32 = 3,
    TokenNewLine:i32 = 4,
    TokenSymbol:i32 = 5;

const jump_table: Uint16Array = new Uint16Array(191488);

export {jump_table};

const id:u16 = 2, num:u16 = 4, hex:u16 = 16, oct:u16 = 32, bin:u16 = 64;

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
            length: i32 = this.tl,
            off: i32 = this.off + length,
            type: i32 = 0,
            base: i32 = off;

        this.ty = 0;
        this.id = 0;

        if (off >= str.length) {
            this.off = l;
            this.tl = 0;
            return this;
        }

        const code:i32 = str.codePointAt(off);

        switch (jump_table[code] & 255) {
            case 0: //SYMBOL
                type = TokenSymbol;
                break;
            case 1: //IDENTIFIER
                while (1) {
                    while (++off < l && (((id | num) & (jump_table[str.codePointAt(off)] >> 8))));
                    type = TokenIdentifier;
                    length = off - base;
                    break;
                } break;
            case 2: //SPACE SET
                ++off;
                type = TokenSpace;
                length = off - base;
                break;
            case 3: //CARRIAGE RETURN
                length = 2;
            //intentional
            case 4: //LINEFEED
                type = TokenNewLine;
                base = off;
                off += length;
                break;
            case 5: //NUMBER
                type = TokenNumber;
                //Check for binary, hexadecimal, and octal representation
                while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)));
                length = off - base;
                break;
        }

        if (type == TokenSymbol || type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base+0)
if(val == 60){
this.id =10; length = 1;
}
else if(val == 62){
this.id =11; length = 1;
}
else if(val == 102){
const val: u32 = str.charCodeAt(base+1)
if(val == 111){
const val: u32 = str.charCodeAt(base+2)
if(val == 114){
this.id =12; length = 3;
}
}
}
else if(val == 40){
this.id =13; length = 1;
}
else if(val == 59){
this.id =14; length = 1;
}
else if(val == 41){
this.id =15; length = 1;
}
else if(val == 99){
const val: u32 = str.charCodeAt(base+1)
if(val == 111){
const val: u32 = str.charCodeAt(base+2)
if(val == 110){
const val: u32 = str.charCodeAt(base+3)
if(val == 115){
const val: u32 = str.charCodeAt(base+4)
if(val == 116){
this.id =16; length = 5;
}
}
}
}
}
else if(val == 44){
this.id =17; length = 1;
}
else if(val == 43){
this.id =18; length = 1;
}
else if(val == 42){
this.id =19; length = 1;
}
        }

        this.ty = type;
        this.off = base;
        this.tl = length;

        return this;
    }
    get pk() : Lexer { return this.peek(); }
    get n() : Lexer  { return this.next(); }
    get END() : boolean { return this.off >= str.length; }
}

            var 

                action_array: Uint32Array = new Uint32Array(1048576), 
                error_array:Uint32Array= new Uint32Array(512),
                mark_: u32 = 0, 
                pointer: u32  = 0,
                error_ptr: u32  = 0;

            @inline
            function mark (): u32{
               mark_ = pointer;
               return mark_;
            }

            @inline
            function reset(mark:u32): void{
                pointer = mark;
            }
            
            @inline
            function add_skip(char_len:u32): void{
                const ACTION: u32 = 3;
                const val: u32 = ACTION | (char_len << 2);
                action_array[pointer++] = val;
            }

            @inline
            function add_shift(char_len:u32): void{
                if(char_len < 1) return;
                const ACTION: u32 = 2;
                const val: u32 = ACTION | (char_len << 2);
                action_array[pointer++] = val;
            }

            @inline
            function add_reduce(sym_len:u32, body:u32): void{
                const ACTION: u32 = 1;
                const val: u32 = ACTION | ((sym_len & 0x3FFF )<< 2) | (body << 16);
                action_array[pointer++] = val;
            }
            
            
    @inline
    function lm(lex:Lexer, syms: u32[]): boolean { 

        const l = syms.length;

        for(let i = 0; i < l; i++){
            const sym = syms[i];
            if(lex.id == sym || lex.ty == sym) return true;
        }

        return false;
    }

    @inline
    function fail(lex:Lexer):void { 
        FAILED = true;
        error_array[error_ptr++] = lex.off;
    }
            
            
    function _(lex: Lexer, /* eh, */ skips: u32[], sym: u32 = 0):void {

        if(FAILED) return;
        
        if (sym == 0 || lex.id == sym || lex.ty == sym) {
            
            add_shift(lex.tl);

            lex.next();
        
            const off: u32 = lex.off;
        
            if (skips) while (lm(lex, skips)) lex.next();

            const diff: i32 = lex.off-off;

            if(diff > 0) add_skip(diff);
        } else {
        
            //TODO error recovery

            FAILED = true;
            error_array[error_ptr++] = lex.off;
        }
    }
            
    
    function $S(l:Lexer) :void{
    
    if(FAILED) return;
    $B(l)
    prod = (FAILED) ? -1 : 0
    
    add_reduce(1,0);
    return;
    FAILED = true
    }
    function $B(l:Lexer) :void{
    const id:u32 = l.id ;
    if(id == 10/* < */){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 10/* < */);
    
    if(FAILED) return;
    $expression(l)
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 11/* > */);
    prod = (FAILED) ? -1 : 1
    
    add_reduce(3,1);
    return;
    }
    if(id == 12/* for */){
    
    if(FAILED) return;
    $for_stmt(l)
    prod = (FAILED) ? -1 : 1
    
    add_reduce(1,2);
    return;
    }
    FAILED = true
    }
    function $for_stmt(l:Lexer) :void{
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 12/* for */);
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 13/* ( */);
    
    if(FAILED) return;
    $const(l)
    
    if(FAILED) return;
    $expression(l)
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 14/* ; */);
    
    if(FAILED) return;
    $expression(l)
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 15/* ) */);
    
    if(FAILED) return;
    $expression(l)
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 14/* ; */);
    prod = (FAILED) ? -1 : 2
    
    add_reduce(9,3);
    return;
    FAILED = true
    }
    function $const(l:Lexer) :void{
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 16/* const */);
    
    if(FAILED) return;
    $expression(l)
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 14/* ; */);
    prod = (FAILED) ? -1 : 3
    
    add_reduce(3,4);
    return;
    FAILED = true
    }
    
    
    
    function $add(l:Lexer) :void{
    
    if(FAILED) return;
    $mult(l)
    const id:u32 = l.id ;
    if(id == 18/* + */){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 18/* + */);
    
    if(FAILED) return;
    $add(l)
    prod = (FAILED) ? -1 : 7
    
    add_reduce(3,11);
    return;
    }
    prod = (FAILED) ? -1 : 7
    
    add_reduce(1,12);
    return;
    FAILED = true
    }
    function $mult(l:Lexer) :void{
    
    if(FAILED) return;
    $sym(l)
    const id:u32 = l.id ;
    if(id == 19/* * */){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 19/* * */);
    
    if(FAILED) return;
    $mult(l)
    prod = (FAILED) ? -1 : 8
    
    add_reduce(3,13);
    return;
    }
    prod = (FAILED) ? -1 : 8
    
    add_reduce(1,14);
    return;
    FAILED = true
    }
    function $sym(l:Lexer) :void{
    
    if(FAILED) return;
    $id(l)
    prod = (FAILED) ? -1 : 9
    
    add_reduce(1,15);
    return;
    FAILED = true
    }
    function $id(l:Lexer) :void{
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 10
    
    add_reduce(1,16);
    return;
    FAILED = true
    }
    function $num(l:Lexer) :void{
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 2/* num */);
    prod = (FAILED) ? -1 : 11
    
    add_reduce(1,17);
    return;
    FAILED = true
    }
    function $expression_list_HC_listbody3_100(l:Lexer):void{
    const sp: u32 = stack_ptr;
    switch(l.id){
    case 19: /* * */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 19/* * */);
    
    $mult(l)
    prod = (FAILED) ? -1 : 8
    
    add_reduce(3,13);
    ;
    break;
    case 18: /* + */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 18/* + */);
    
    $add(l)
    prod = (FAILED) ? -1 : 7
    
    add_reduce(3,11);
    ;
     default : 
    switch(l.ty){
    case 3/* id */: /* id */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 10
    
    add_reduce(1,16);
    ;
    break;
    }
    break;
    }
    var a:i32 = prod;
    while(1){  
    if(prod >= 0) a = prod;
    if(sp > stack_ptr) break; else stack_ptr += 1;
    prod = -1;
    switch(a) {
    case 10:
    State6(l)
     continue;
    case 9:
    State4(l)
    if(prod < 0)
    State18(l)
    else continue;
     continue;
    case 8:
    State5(l)
    if(prod < 0)
    State17(l)
    else continue;
     continue;
    case 7:
    State3(l)
    if(prod < 0)
    State19(l)
    else continue;
     continue;
    case 6:
    State2(l)
     continue;
    case 4:
    State1(l)
     continue;
    }
    break;
    }
    if(sp <= stack_ptr) prod = a;
    if(![4].includes(a))fail(l);
    }
    function State1(l:Lexer):void{
    if([17].includes(l.id)){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 17/* , */);
    
    $expression(l)
    prod = (FAILED) ? -1 : 4
    
    add_reduce(3,5);
    ;
    }
    }
    function State2(l:Lexer):void{
    if([17].includes(l.id)){
    stack_ptr -= 1 
    add_reduce(1,6);
    prod = 4
    return;
    }
    }
    function State3(l:Lexer):void{
    if([11,14,15,17].includes(l.id)){
    stack_ptr -= 1 
    add_reduce(1,9);
    prod = 6
    return;
    }
    }
    function State4(l:Lexer):void{
    switch(l.id){
    case 19: /* * */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 19/* * */);
    
    $mult(l)
    prod = (FAILED) ? -1 : 8
    
    add_reduce(3,13);
    ;
    break;
    case 15: /* ) */
    case 17: /* , */
    case 14: /* ; */
    case 11: /* > */
    stack_ptr -= 1 
    add_reduce(1,10);
    prod = 6
    return;
    stack_ptr -= 1 
    add_reduce(1,14);
    prod = 8
    return;
    case 18: /* + */
    stack_ptr -= 1 
    add_reduce(1,14);
    prod = 8
    return;
    }
    }
    function State5(l:Lexer):void{
    switch(l.id){
    case 18: /* + */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 18/* + */);
    
    $add(l)
    prod = (FAILED) ? -1 : 7
    
    add_reduce(3,11);
    ;
    break;
    case 15: /* ) */
    case 17: /* , */
    case 14: /* ; */
    case 11: /* > */
    stack_ptr -= 1 
    add_reduce(1,12);
    prod = 7
    return;
    }
    }
    function State6(l:Lexer):void{
    if([11,14,15,17,18,19].includes(l.id)){
    stack_ptr -= 1 
    add_reduce(1,15);
    prod = 9
    return;
    }
    }
    function $expression_list(l:Lexer):void{
    const sp: u32 = stack_ptr;
    if([3/* id */].includes(l.ty)){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 10
    
    add_reduce(1,16);
    ;
    }
    var a:i32 = prod;
    while(1){  
    if(prod >= 0) a = prod;
    if(sp > stack_ptr) break; else stack_ptr += 1;
    prod = -1;
    switch(a) {
    case 10:
    State6(l)
     continue;
    case 9:
    State4(l)
     continue;
    case 8:
    State5(l)
     continue;
    case 7:
    State3(l)
     continue;
    case 6:
    State10(l)
     continue;
    case 5:
    State9(l)
     continue;
    }
    break;
    }
    if(sp <= stack_ptr) prod = a;
    if(![5].includes(a))fail(l);
    }
    function State9(l:Lexer):void{
    if([17].includes(l.id)){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 17/* , */);
    
    $expression(l)
    prod = (FAILED) ? -1 : 5
    
    add_reduce(3,7);
    ;
    }
    }
    function State10(l:Lexer):void{
    if([17].includes(l.id)){
    stack_ptr -= 1 
    add_reduce(1,8);
    prod = 5
    return;
    }
    }
    function $expression(l:Lexer):void{
    const sp: u32 = stack_ptr;
    if([3/* id */].includes(l.ty)){
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 10
    
    add_reduce(1,16);
    ;
    }
    var a:i32 = prod;
    while(1){  
    if(prod >= 0) a = prod;
    if(sp > stack_ptr) break; else stack_ptr += 1;
    prod = -1;
    switch(a) {
    case 10:
    State6(l)
     continue;
    case 9:
    State4(l)
     continue;
    case 8:
    State5(l)
     continue;
    case 7:
    State3(l)
     continue;
    }
    break;
    }
    if(sp <= stack_ptr) prod = a;
    if(![6].includes(a))fail(l);
    }
    function State17(l:Lexer):void{
    if([11,14,15,17,18].includes(l.id)){
    stack_ptr -= 3 
    add_reduce(3,13);
    prod = 8
    return;
    }
    }
    function State18(l:Lexer):void{
    switch(l.id){
    case 19: /* * */
    
    _(l, /* e.eh, */ [1/* ws */,4/* nl */], 19/* * */);
    
    $mult(l)
    prod = (FAILED) ? -1 : 8
    
    add_reduce(3,13);
    ;
    break;
    case 15: /* ) */
    case 18: /* + */
    case 17: /* , */
    case 14: /* ; */
    case 11: /* > */
    stack_ptr -= 1 
    add_reduce(1,14);
    prod = 8
    return;
    }
    }
    function State19(l:Lexer):void{
    if([11,14,15,17].includes(l.id)){
    stack_ptr -= 3 
    add_reduce(3,11);
    prod = 7
    return;
    }
    }

    export class Export {

        FAILED: boolean;

        er: Uint32Array;
        
        aa: Uint32Array;

        constructor(f:boolean, er:Uint32Array, aa: Uint32Array){
            this.FAILED = f;
            this.er = er;
            this.aa = aa;
        }

        getFailed(): boolean { return this.FAILED; }
        
        getActionList(): Uint32Array { return this.aa; }
        
        getErrorOffsets(): Uint32Array { return this.er; }
    }
            
    export default function main (input_string:string): Export {

        str = input_string;

        const lex = new Lexer();

        lex.next();

        prod = -1; 

        stack_ptr = 0;

        error_ptr = 0;

        pointer = 0;

        FAILED = false;

        $S(lex);

        action_array[pointer++] = 0;

        return new Export(
            FAILED || !lex.END,
        error_array.subarray(0, error_ptr),
        action_array.subarray(0, pointer)
    );    
}