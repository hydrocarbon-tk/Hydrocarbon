

 

const 
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(true, 4194304, 163920),
    debug_stack = [],
    recognizer = 
        ((store_data, debug_stack)=>{
            const data_view = new DataView(store_data);
            function load(offset){
                return data_view.getUint16(offset, true);
            };
            function store(offset, val){
                data_view.setUint32(offset, val, true);
            };
            const action_array_offset = 382976;
const error_array_offset = 4577280;
const TokenSpace = 1;
const TokenNumber = 2;
const TokenIdentifier = 4;
const TokenNewLine = 8;
const TokenSymbol = 16;
const id = 2;
const num = 4;
let action_ptr = 0;
let error_ptr = 0;
let str;
class State {
    constructor(){
        this.flags = 2;
        this.prod = -1;
    }
    copy(destination = new State()){
        destination.flags = this.flags;
        return destination;
    }
    sync(marker = new State()){
        marker.copy(this);
    }
    getFAILED(){
        return (this.flags&1)==1;
    }
    setFAILED(failed){
        this.flags = (this.flags&0xFFFFFFFE)|failed;
    }
    getENABLE_STACK_OUTPUT(){
        return (this.flags&2)>0;
    }
    setENABLE_STACK_OUTPUT(enabled){
        this.flags = (this.flags&0xFFFFFFFD)|enabled;
    }
    getProd(){
        return this.flags>>12;
    }
    setProd(prod_val){
        this.flags = (this.flags&0xFFF)|(prod_value<<12);
    }
}
function getTypeAt(code_point){
    switch(load(code_point<<1)&255){
        default:
        case 0:
            return TokenSymbol;
        case 1:
            return TokenIdentifier;
        case 2:
            return TokenSpace;
        case 3:
        case 4:
            return TokenNewLine;
        case 5:
            return TokenNumber;
    }
    return 0;
}
class Lexer {
    constructor(){
        this.ty = 0;
        this.tl = 0;
        this.off = 0;
        this.utf = 0;
        this.prev_off = 0;
    }
    copy(destination = new Lexer()){
        destination.utf = this.utf;
        destination.ty = this.ty;
        destination.tl = this.tl;
        destination.off = this.off;
        destination.prev_off = this.prev_off;
        return destination;
    }
    sync(marker = new Lexer()){
        marker.copy(this);
    }
    isSym(){
        return this.ty==TokenSymbol;
    }
    isNL(){
        return this.ty==TokenNewLine;
    }
    isSP(){
        return this.ty==TokenSpace;
    }
    isNum(){
        if(this.ty==TokenNumber){
            this.consumeNumeric();
            return true;
        }
        return false;
    }
    isID(){
        if(this.ty==TokenIdentifier){
            this.consumeIdentifier();
            return true;
        }
        return false;
    }
    typeIs(flag){
        return (this.ty&flag)==this.ty;
    }
    consumeNumeric(){
        const l = str.length;
        let off = this.off;
        this.tl = 1;
        while((++off<l)&&(num&(load(0+(str.codePointAt(off)<<1))>>8))){
            this.tl++;
        }
    }
    consumeIdentifier(){
        const l = str.length;
        let off = this.off;
        this.tl = 1;
        while((++off<l)&&((num|id)&(load(0+(str.codePointAt(off)<<1))>>8))){
            this.tl++;
        }
    }
    getUTF(delta = 0){
        return str.codePointAt(this.off+delta);
    }
    getOffsetRegionDelta(){
        return this.off-this.prev_off;
    }
    advanceOffsetRegion(){
        this.prev_off = this.off+this.tl;
    }
    syncOffsetRegion(){
        this.prev_off = this.off;
    }
    typeAt(offset = 0){
        offset = this.off+offset;
        if(offset>=str.length){
            return 0;
        }
        return getTypeAt(str.codePointAt(offset));
    }
    next(){
        this.off = this.off+this.tl;
        this.tl = 1;
        if(this.off>=str.length){
            this.ty = 0;
            this.tl = 0;
            this.utf = -1;
            this.off = str.length;
        } else {
            this.utf = str.codePointAt(this.off);
            this.ty = getTypeAt(this.utf);
        }
        return this;
    }
    END(){
        return this.off>=str.length;
    }
}
function cp04c2f086_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==952)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp05fab317_(l){
    let ACCEPT = false;
    if((((((l.getUTF(5)==69)&&(l.getUTF(4)==82))&&(l.getUTF(3)==79))&&(l.getUTF(2)==78))&&(l.getUTF(1)==71))&&(l.getUTF(0)==73)){
        l.ty = TokenSymbol;
        l.tl = 6;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp14d8f4e6_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==99){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
        if(l.getUTF(1)==115){
            if((l.typeAt(4)!=TokenIdentifier)&&((l.getUTF(3)==114)&&(l.getUTF(2)==116))){
                l.ty = TokenSymbol;
                l.tl = 4;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cp1a9bf43b_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==40){
        val = l.getUTF(1);
        if(val==42){
            l.ty = TokenSymbol;
            l.tl = 2;
            ACCEPT = true;
        } else if(val==43){
            l.ty = TokenSymbol;
            l.tl = 2;
            ACCEPT = true;
        }
    }
    return ACCEPT;
}
function cp1cfc201e_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==58)&&(l.getUTF(0)==58)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp1ee9b1c3_(l){
    let ACCEPT = false;
    if(((((l.getUTF(4)==82)&&(l.getUTF(3)==79))&&(l.getUTF(2)==82))&&(l.getUTF(1)==82))&&(l.getUTF(0)==69)){
        l.ty = TokenSymbol;
        l.tl = 5;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp22010287_(l){
    let ACCEPT = false;
    if((((l.getUTF(3)==69)&&(l.getUTF(2)==77))&&(l.getUTF(1)==65))&&(l.getUTF(0)==78)){
        l.ty = TokenSymbol;
        l.tl = 4;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp31779bfd_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==603)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp34ba70c2_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==83)&&(l.getUTF(0)==65)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp363046c5_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==115)&&(l.getUTF(0)==97)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp385f1331_(l){
    let ACCEPT = false;
    if((((((l.getUTF(5)==76)&&(l.getUTF(4)==79))&&(l.getUTF(3)==66))&&(l.getUTF(2)==77))&&(l.getUTF(1)==89))&&(l.getUTF(0)==83)){
        l.ty = TokenSymbol;
        l.tl = 6;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp3c8dfde3_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==78)&&(l.getUTF(1)==71))&&(l.getUTF(0)==73)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp42ce3393_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==104)&&(l.getUTF(1)==114))&&(l.getUTF(0)==101)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp5526201f_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==114){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
        if(l.getUTF(1)==101){
            if((l.typeAt(6)!=TokenIdentifier)&&((((l.getUTF(5)==110)&&(l.getUTF(4)==114))&&(l.getUTF(3)==117))&&(l.getUTF(2)==116))){
                l.ty = TokenSymbol;
                l.tl = 6;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cp5c0ffb1b_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==114){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
        if(l.getUTF(1)==101){
            if((((l.getUTF(5)==110)&&(l.getUTF(4)==114))&&(l.getUTF(3)==117))&&(l.getUTF(2)==116)){
                l.ty = TokenSymbol;
                l.tl = 6;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cp5c8b4724_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==82)&&(l.getUTF(1)==82))&&(l.getUTF(0)==69)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp695add08_(l){
    let ACCEPT = false;
    if((l.typeAt(4)!=TokenIdentifier)&&((((l.getUTF(3)==75)&&(l.getUTF(2)==82))&&(l.getUTF(1)==79))&&(l.getUTF(0)==70))){
        l.ty = TokenSymbol;
        l.tl = 4;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp6cd35bb4_(l){
    let ACCEPT = false;
    if((((((l.getUTF(5)==84)&&(l.getUTF(4)==82))&&(l.getUTF(3)==79))&&(l.getUTF(2)==80))&&(l.getUTF(1)==77))&&(l.getUTF(0)==73)){
        l.ty = TokenSymbol;
        l.tl = 6;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp7031a1c3_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==62)&&(l.getUTF(0)==60)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp723fc2c3_(l){
    let ACCEPT = false;
    if((l.typeAt(3)!=TokenIdentifier)&&(((l.getUTF(2)==104)&&(l.getUTF(1)==114))&&(l.getUTF(0)==101))){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp7c689f5d_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==62)&&(l.getUTF(0)==43)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp852e887f_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==84)&&(l.getUTF(1)==83))&&(l.getUTF(0)==82)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cp8c41b003_(l){
    let ACCEPT = false;
    if((((l.getUTF(3)==67)&&(l.getUTF(2)==69))&&(l.getUTF(1)==82))&&(l.getUTF(0)==80)){
        l.ty = TokenSymbol;
        l.tl = 4;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpa3161ff8_(l){
    let ACCEPT = false;
    if((l.typeAt(3)!=TokenIdentifier)&&(((l.getUTF(2)==78)&&(l.getUTF(1)==71))&&(l.getUTF(0)==73))){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpac314ec7_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==82){
        val = l.getUTF(1);
        if(val==69){
            if((l.typeAt(3)!=TokenIdentifier)&&(l.getUTF(2)==68)){
                l.ty = TokenSymbol;
                l.tl = 3;
                ACCEPT = true;
            }
        } else if(val==83){
            if((l.typeAt(3)!=TokenIdentifier)&&(l.getUTF(2)==84)){
                l.ty = TokenSymbol;
                l.tl = 3;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cpb00d90df_(l){
    let ACCEPT = false;
    if((((l.getUTF(3)==102)&&(l.getUTF(2)==111))&&(l.getUTF(1)==101))&&(l.getUTF(0)==36)){
        l.ty = TokenSymbol;
        l.tl = 4;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpbe69605d_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==99){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
        if(l.getUTF(1)==115){
            if((l.getUTF(3)==114)&&(l.getUTF(2)==116)){
                l.ty = TokenSymbol;
                l.tl = 4;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cpc20f43f7_(l){
    let ACCEPT = false;
    if((l.getUTF(1)==62)&&(l.getUTF(0)==61)){
        l.ty = TokenSymbol;
        l.tl = 2;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpc2927e6c_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==116)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpc296ddfa_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==103)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpc9425d40_(l){
    let ACCEPT = false;
    if((((((l.getUTF(5)==58)&&(l.getUTF(4)==116))&&(l.getUTF(3)==102))&&(l.getUTF(2)==105))&&(l.getUTF(1)==104))&&(l.getUTF(0)==115)){
        l.ty = TokenSymbol;
        l.tl = 6;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpcce76379_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==102)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpd0b33b0f_(l){
    let ACCEPT = false;
    if((l.typeAt(1)!=TokenIdentifier)&&(l.getUTF(0)==964)){
        l.ty = TokenSymbol;
        l.tl = 1;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpd9ab2d28_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==69){
        val = l.getUTF(1);
        if(val==82){
            if((l.typeAt(3)!=TokenIdentifier)&&(l.getUTF(2)==82)){
                l.ty = TokenSymbol;
                l.tl = 3;
                ACCEPT = true;
            }
        } else if(val==88){
            if((l.typeAt(3)!=TokenIdentifier)&&(l.getUTF(2)==67)){
                l.ty = TokenSymbol;
                l.tl = 3;
                ACCEPT = true;
            }
        }
    }
    return ACCEPT;
}
function cpdd70184b_(l){
    let ACCEPT = false;
    if(((((((l.getUTF(6)==58)&&(l.getUTF(5)==116))&&(l.getUTF(4)==114))&&(l.getUTF(3)==101))&&(l.getUTF(2)==115))&&(l.getUTF(1)==115))&&(l.getUTF(0)==97)){
        l.ty = TokenSymbol;
        l.tl = 7;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpddb05f11_(l){
    let ACCEPT = false;
    if((((l.getUTF(3)==75)&&(l.getUTF(2)==82))&&(l.getUTF(1)==79))&&(l.getUTF(0)==70)){
        l.ty = TokenSymbol;
        l.tl = 4;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpeb1660e5_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==67)&&(l.getUTF(1)==88))&&(l.getUTF(0)==69)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpef41edcb_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==84)&&(l.getUTF(1)==88))&&(l.getUTF(0)==69)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpf2f5ccde_(l){
    let ACCEPT = false;
    if(((l.getUTF(2)==68)&&(l.getUTF(1)==69))&&(l.getUTF(0)==82)){
        l.ty = TokenSymbol;
        l.tl = 3;
        ACCEPT = true;
    }
    return ACCEPT;
}
function cpf91cbc18_(l){
    let ACCEPT = false;
    let val = 0;
    if(l.getUTF(0)==40){
        val = l.getUTF(1);
        if(val==43){
            l.ty = TokenSymbol;
            l.tl = 2;
            ACCEPT = true;
        } else if(val==42){
            l.ty = TokenSymbol;
            l.tl = 2;
            ACCEPT = true;
        }
    }
    return ACCEPT;
}
function skip_fn_(l){
    while(1){
        if(!(l.isSP()/*[ws]*/||l.isNL()/*[nl]*/)){
            break;
        }
        l.next();
    }
    return l;
}
function skip_fn_000(l){
    while(1){
        if(!(l.isNL()/*[nl]*/)){
            break;
        }
        l.next();
    }
    return l;
}
function skip_fn_001(l){
    while(1){
        if(!(l.isSP()/*[ws]*/)){
            break;
        }
        l.next();
    }
    return l;
}
function set_error(val){
    if(error_ptr>=40980){
        return;
    }
    store((error_ptr++<<2)+error_array_offset,val);
}
function set_action(val){
    store((action_ptr++<<2)+action_array_offset,val);
}
function mark(){
    return action_ptr;
}
function assert_table(l,a,b,c,d){
    const utf = l.utf;
    if(utf<32){
        return (a&(1<<utf))!=0;
    } else if(utf<64){
        return (b&(1<<(utf-32)))!=0;
    } else if(utf<96){
        return (c&(1<<(utf-64)))!=0;
    } else if(utf<128){
        return (d&(1<<(utf-96)))!=0;
    }
    return false;
}
function reset(mark,origin,advanced,state,pass){
    if(!state.getFAILED()&&pass){
        return false;
    }
    action_ptr = mark;
    advanced.sync(origin);
    state.setFAILED(false);
    return true;
}
function add_shift(l,char_len){
    const skip_delta = l.getOffsetRegionDelta();
    let has_skip = skip_delta>0;
    let has_len = char_len>0;
    let val = 1;
    val|=(skip_delta<<3);
    if(has_skip&&((skip_delta>36863)||(char_len>36863))){
        add_shift(l,0);
        has_skip = 0;
        val = 1;
    }
    val|=(((has_skip<<2)|(has_len<<1))|(char_len<<(3+(15*has_skip))));
    set_action(val);
    l.advanceOffsetRegion();
}
function add_reduce(state,sym_len,body,DNP = false){
    if(state.getENABLE_STACK_OUTPUT()){
        set_action(((DNP<<1)|((sym_len&16383)<<2))|(body<<16));
    }
}
function fail(l,state){
    if(!state.getFAILED()&&state.getENABLE_STACK_OUTPUT()){
        soft_fail(l,state);
    }
    return false;
}
function soft_fail(l,state){
    state.setFAILED(true);
    set_error(l.off);
}
function assertSuccess(l,state,condition){
    if(!condition||state.getFAILED()){
        return fail(l,state);
    }
    return true;
}
function consume(l,state){
    if(state.getENABLE_STACK_OUTPUT()){
        add_shift(l,l.tl);
    }
    l.next();
}
function consume_empty(l){
    add_shift(l,0);
}
function assert_consume(l,state,accept){
    if(state.getFAILED()){
        return false;
    }
    if(accept){
        consume(l,state);
        return true;
    } else {
        return false;
    }
}
function reset_counters_and_pointers(){
    error_ptr = 0;
    action_ptr = 0;
}
function $hydrocarbon(l,state){
    if($head(l,state)){
        add_reduce(state,1,1);
        state.prod = 0;
    }
    /*value*/
    return assertSuccess(l,state,state.prod==0);
}
function $head(l,state){
    if(assert_table(l,0x0,0x8,0x1,0x0)/*tbl:[ # ] [ @ ]*/){
        if($pre$preamble(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($prd$productions(l,state)){
                add_reduce(state,2,2);
                state.prod = 1;
            }
        }
    } else {
        if($prd$productions(l,state)){
            add_reduce(state,1,3);
            state.prod = 1;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==1);
}
function $pre$preamble(l,state){
    if($pre$preamble_clause(l,state)){
        add_reduce(state,1,5);
        state.prod = 4;
    }
    while(state.prod==4){
        let ACCEPT = false;
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_table(l,0x0,0x8,0x1,0x0)/*tbl:[ # ] [ @ ]*/){
            if($pre$preamble_clause(l,state)){
                add_reduce(state,2,4);
                state.prod = 4;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==4);
}
function $pre$preamble_clause(l,state){
    if(l.utf==35/*[#]*/){
        if($cm$cm(l,state)){
            state.prod = 5;
        }
    } else if(l.utf==64/*[@]*/){
        let pk = l.copy();
        skip_fn_(pk.next()/*[ ws ][ nl ]*/);
        if(cp6cd35bb4_(pk)/*[IMPORT]*/){
            if($pre$import_preamble(l,state)){
                state.prod = 5;
            }
        } else if(cp1ee9b1c3_(pk)/*[ERROR]*/){
            if($pre$error_preamble(l,state)){
                state.prod = 5;
            }
        } else if(cpef41edcb_(pk)/*[EXT]*/){
            if($pre$ext_preamble(l,state)){
                state.prod = 5;
            }
        } else if(cp22010287_(pk)/*[NAME]*/){
            if($pre$name_preamble(l,state)){
                state.prod = 5;
            }
        } else if(cp8c41b003_(pk)/*[PREC]*/){
            if($pre$precedence_preamble(l,state)){
                state.prod = 5;
            }
        } else if(cp385f1331_(pk)/*[SYMBOL]*/){
            if($pre$symbols_preamble(l,state)){
                state.prod = 5;
            }
        } else {
            if($pre$ignore_preamble(l,state)){
                state.prod = 5;
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==5);
}
function $pre$symbols_preamble_HC_listbody2_101(l,state){
    if($sym$lexer_symbol(l,state)){
        add_reduce(state,1,5);
        state.prod = 6;
    }
    while(state.prod==6){
        let ACCEPT = false;
        skip_fn_001(l/*[ ws ]*/);
        if(l.isNL()/*[nl]*/){
            break;
        }
        if(l.isID()/*[id]*/||l.isSym()/*[sym]*/){
            if($sym$lexer_symbol(l,state)){
                add_reduce(state,2,4);
                state.prod = 6;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==6);
}
function $pre$symbols_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp385f1331_(l)/*[SYMBOL]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($pre$symbols_preamble_HC_listbody2_101(l,state)){
                skip_fn_001(l/*[ ws ]*/);
                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                    add_reduce(state,4,6);
                    state.prod = 7;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==7);
}
function $pre$precedence_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp8c41b003_(l)/*[PREC]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$terminal_symbol(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.isNum()/*[num]*/)){
                    skip_fn_001(l/*[ ws ]*/);
                    if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                        add_reduce(state,5,7);
                        state.prod = 8;
                    }
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==8);
}
function $pre$ignore_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp05fab317_(l)/*[IGNORE]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$ignore_symbols(l,state)){
                skip_fn_001(l/*[ ws ]*/);
                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                    add_reduce(state,4,8);
                    state.prod = 9;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==9);
}
function $pre$error_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp1ee9b1c3_(l)/*[ERROR]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$ignore_symbols(l,state)){
                skip_fn_001(l/*[ ws ]*/);
                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                    add_reduce(state,4,9);
                    state.prod = 10;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==10);
}
function $pre$name_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp22010287_(l)/*[NAME]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($def$js_id_symbols(l,state)){
                skip_fn_001(l/*[ ws ]*/);
                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                    add_reduce(state,4,10);
                    state.prod = 11;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==11);
}
function $pre$ext_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cpef41edcb_(l)/*[EXT]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($def$js_id_symbols(l,state)){
                skip_fn_001(l/*[ ws ]*/);
                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                    add_reduce(state,4,11);
                    state.prod = 12;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==12);
}
function $pre$import_preamble_HC_listbody2_102(l,state){
    if(assert_consume(l,state,l.isSP()/*[ws]*/)){
        add_reduce(state,1,5);
        state.prod = 13;
    }
    while(state.prod==13){
        let ACCEPT = false;
        skip_fn_000(l/*[ nl ]*/);
        if(assert_consume(l,state,l.isSP()/*[ws]*/)){
            add_reduce(state,2,4);
            state.prod = 13;
            ACCEPT = true;
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==13);
}
function $pre$import_preamble_group_018_103(l,state){
    if(assert_consume(l,state,l.isSym()/*[sym]*/||l.isID()/*[id]*/)){
        state.prod = 14;
    }
    return assertSuccess(l,state,state.prod==14);
}
function $pre$import_preamble_HC_listbody1_104(l,state){
    if($pre$import_preamble_group_018_103(l,state)){
        add_reduce(state,1,13);
        state.prod = 15;
    }
    while(state.prod==15){
        let ACCEPT = false;
        skip_fn_000(l/*[ nl ]*/);
        if(l.isSP()/*[ws]*/){
            break;
        }
        if(l.isSym()/*[sym]*/||l.isID()/*[id]*/){
            if($pre$import_preamble_group_018_103(l,state)){
                add_reduce(state,2,12);
                state.prod = 15;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==15);
}
function $pre$import_preamble_HC_listbody4_105(l,state){
    if(assert_consume(l,state,l.isSP()/*[ws]*/)){
        add_reduce(state,1,5);
        state.prod = 16;
    }
    while(state.prod==16){
        let ACCEPT = false;
        skip_fn_000(l/*[ nl ]*/);
        if(assert_consume(l,state,l.isSP()/*[ws]*/)){
            add_reduce(state,2,4);
            state.prod = 16;
            ACCEPT = true;
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==16);
}
function $pre$import_preamble_group_020_106(l,state){
    if(assert_consume(l,state,cp363046c5_(l)/*[as]*/||cp34ba70c2_(l)/*[AS]*/)){
        state.prod = 17;
    }
    return assertSuccess(l,state,state.prod==17);
}
function $pre$import_preamble(l,state){
    if(assert_consume(l,state,l.utf==64/*[@]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp6cd35bb4_(l)/*[IMPORT]*/)){
            skip_fn_000(l/*[ nl ]*/);
            if(l.isSP()/*[ws]*/){
                if($pre$import_preamble_HC_listbody2_102(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($pre$import_preamble_HC_listbody1_104(l,state)){
                        skip_fn_000(l/*[ nl ]*/);
                        if($pre$import_preamble_HC_listbody4_105(l,state)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if($pre$import_preamble_group_020_106(l,state)){
                                skip_fn_(l/*[ ws ][ nl ]*/);
                                if($def$js_id_symbols(l,state)){
                                    skip_fn_001(l/*[ ws ]*/);
                                    if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                                        add_reduce(state,8,14);
                                        state.prod = 18;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if($pre$import_preamble_HC_listbody1_104(l,state)){
                    skip_fn_000(l/*[ nl ]*/);
                    if($pre$import_preamble_HC_listbody4_105(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if($pre$import_preamble_group_020_106(l,state)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if($def$js_id_symbols(l,state)){
                                skip_fn_001(l/*[ ws ]*/);
                                if(assert_consume(l,state,l.isNL()/*[nl]*/)){
                                    add_reduce(state,7,14);
                                    state.prod = 18;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==18);
}
function $prd$productions(l,state){
    if(assert_consume(l,state,l.utf==603/*[ɛ]*/)){
        state.prod = 20;
    } else if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
        if($fn$referenced_function(l,state)){
            add_reduce(state,1,16);
            state.prod = 20;
        }
    } else {
        if($prd$production(l,state)){
            add_reduce(state,1,15);
            state.prod = 20;
        }
    }
    while(state.prod==20){
        let ACCEPT = false;
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(l.utf==35/*[#]*/){
            if($cm$cm(l,state)){
                add_reduce(state,2,1);
                state.prod = 20;
                ACCEPT = true;
            }
        } else if(cp7c689f5d_(l)/*[+>]*/||cp7031a1c3_(l)/*[<>]*/){
            if($prd$production(l,state)){
                add_reduce(state,2,17);
                state.prod = 20;
                ACCEPT = true;
            }
        } else if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
            if($fn$referenced_function(l,state)){
                add_reduce(state,2,18);
                state.prod = 20;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==20);
}
function $prd$production_group_08_100(l,state){
    if($def$js_id_symbols(l,state)){
        add_reduce(state,1,19);
        state.prod = 21;
    }
    /*value*/
    return assertSuccess(l,state,state.prod==21);
}
function $prd$production_group_010_101(l,state){
    if(assert_consume(l,state,(l.utf==9474/*[│]*/)||assert_table(l,0x0,0x0,0x0,0x10000000)/*tbl:[ | ]*/)){
        state.prod = 22;
    }
    return assertSuccess(l,state,state.prod==22);
}
function $prd$production_group_111_102(l,state){
    if($prd$production_group_010_101(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($fn$error_function(l,state)){
            add_reduce(state,2,0);
            state.prod = 23;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==23);
}
function $prd$production(l,state){
    if(assert_consume(l,state,cp7c689f5d_(l)/*[+>]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($sym$imported_production_symbol(l,state)){
            add_reduce(state,1,20);
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($prd$production_start_symbol(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($pb$production_bodies(l,state)){
                    add_reduce(state,4,23);
                    state.prod = 25;
                }
            }
        }
    } else if(cp7031a1c3_(l)/*[<>]*/){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp7031a1c3_(l)/*[<>]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if((assert_table(l,0x0,0x10,0x80000000,0x0)/*tbl:[ $ ] [ _ ]*/||false)||l.isID()/*[id]*/){
                let mk = mark();
                let anchor = l.copy();
                /*48,5,1,49,4,1,51,4,1*/
                /*25*/
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($prd$production_group_08_100(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($prd$production_start_symbol(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if($pb$production_bodies(l,state)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if((l.utf==9474/*[│]*/)||assert_table(l,0x0,0x0,0x0,0x10000000)/*tbl:[ | ]*/){
                                if($prd$production_group_111_102(l,state)){
                                    add_reduce(state,5,21);
                                    state.prod = 25;
                                }
                            } else {
                                add_reduce(state,4,24);
                                state.prod = 25;
                            }
                        }
                    }
                }
                /*48,5,1,49,4,1,51,4,1*/
                if(reset(mk,anchor,l,state,state.prod==25)){
                    state.prod = -1;
                    if($sym$imported_production_symbol(l,state)){
                        add_reduce(state,1,20);
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if($prd$production_start_symbol(l,state)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if($pb$production_bodies(l,state)){
                                add_reduce(state,4,22);
                                state.prod = 25;
                            }
                        }
                    }
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==25);
}
function $prd$production_start_symbol(l,state){
    if(assert_consume(l,state,(l.utf==8594/*[→]*/)||assert_table(l,0x0,0x40000000,0x0,0x0)/*tbl:[ > ]*/)){
        state.prod = 26;
    }
    return assertSuccess(l,state,state.prod==26);
}
function $pb$production_bodies_group_04_100(l,state){
    if(assert_consume(l,state,(l.utf==9474/*[│]*/)||assert_table(l,0x0,0x0,0x0,0x10000000)/*tbl:[ | ]*/)){
        state.prod = 28;
    }
    return assertSuccess(l,state,state.prod==28);
}
function $pb$production_bodies(l,state){
    if($pb$production_body(l,state)){
        add_reduce(state,1,25);
        state.prod = 29;
    }
    while(state.prod==29){
        let ACCEPT = false;
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(l.utf==35/*[#]*/){
            if($cm$cm(l,state)){
                add_reduce(state,2,27);
                state.prod = 29;
                ACCEPT = true;
            }
        } else if((l.utf==9474/*[│]*/)||assert_table(l,0x0,0x0,0x0,0x10000000)/*tbl:[ | ]*/){
            let pk = l.copy();
            skip_fn_(pk.next()/*[ ws ][ nl ]*/);
            if(cpcce76379_(pk)/*[f]*/||(pk.utf==8614/*[↦]*/)){
                let mk = mark();
                let anchor = l.copy();
                /*58,3,1,48,5,4*/
                /*29*/
                if((l.utf==9474/*[│]*/)||assert_table(l,0x0,0x0,0x0,0x10000000)/*tbl:[ | ]*/){
                    if($pb$production_bodies_group_04_100(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if($pb$production_body(l,state)){
                            add_reduce(state,3,26);
                            state.prod = 29;
                            ACCEPT = true;
                        }
                    }
                }
                if(reset(mk,anchor,l,state,state.prod==29)){
                    state.prod = 29;
                }
            } else if(((((cpb00d90df_(pk)/*[$eof]*/||cpc9425d40_(pk)/*[shift:]*/)||cpdd70184b_(pk)/*[assert:]*/)||pk.isSym()/*[sym]*/)||false)||pk.isID()/*[id]*/){
                if($pb$production_bodies_group_04_100(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($pb$production_body(l,state)){
                        add_reduce(state,3,26);
                        state.prod = 29;
                        ACCEPT = true;
                    }
                }
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==29);
}
function $pb$production_body(l,state){
    if(l.utf==40/*[(]*/){
        let pk = l.copy();
        skip_fn_(pk.next()/*[ ws ][ nl ]*/);
        if(cp695add08_(pk)/*[FORK]*/){
            if($pb$force_fork(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($pb$entries(l,state)){
                    add_reduce(state,2,28);
                    state.prod = 30;
                }
            }
        } else {
            if($pb$entries(l,state)){
                add_reduce(state,1,29);
                state.prod = 30;
            }
        }
    } else {
        if($pb$entries(l,state)){
            add_reduce(state,1,29);
            state.prod = 30;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==30);
}
function $pb$entries(l,state){
    if(assert_consume(l,state,cpb00d90df_(l)/*[$eof]*/)){
        add_reduce(state,1,32);
        state.prod = 31;
    } else if(cp31779bfd_(l)/*[ɛ]*/){
        if($sym$empty_symbol(l,state)){
            add_reduce(state,1,31);
            state.prod = 31;
        }
    } else if(cpcce76379_(l)/*[f]*/||(l.utf==8614/*[↦]*/)){
        if($fn$js_function_start_symbol(l,state)){
            state.prod = 46;
        }
    } else {
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($pb$body_entries(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                let mk = mark();
                let anchor = l.copy();
                /*62,3,1,66,2,1,67,2,1*/
                /*31*/
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($fn$reduce_function(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                        if($fn$error_function(l,state)){
                            add_reduce(state,3,30);
                            state.prod = 31;
                        }
                    } else {
                        add_reduce(state,2,30);
                        state.prod = 31;
                    }
                }
                /*62,3,1,66,2,1,67,2,1*/
                if(reset(mk,anchor,l,state,state.prod==31)){
                    state.prod = -1;
                    if($fn$error_function(l,state)){
                        add_reduce(state,2,34);
                        state.prod = 31;
                    }
                }
            } else {
                add_reduce(state,1,34);
                state.prod = 31;
            }
        }
    }
    while(true){
        let ACCEPT = false;
        switch(state.prod){
            case 32:
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(l.utf==40/*[(]*/){
                    let pk = l.copy();
                    skip_fn_(pk.next()/*[ ws ][ nl ]*/);
                    if((cpac314ec7_(pk)/*[RED] [RST]*/||cpa3161ff8_(pk)/*[IGN]*/)||cpd9ab2d28_(pk)/*[ERR] [EXC]*/){
                        if($pb$condition_clause(l,state)){
                            add_reduce(state,2,37);
                            state.prod = 32;
                            ACCEPT = true;
                        }
                    } else if(((((cpb00d90df_(pk)/*[$eof]*/||cpc9425d40_(pk)/*[shift:]*/)||cpdd70184b_(pk)/*[assert:]*/)||false)||pk.isID()/*[id]*/)||pk.isSym()/*[sym]*/){
                        if($sym$symbol(l,state)){
                            add_reduce(state,2,37);
                            state.prod = 32;
                            ACCEPT = true;
                        }
                    }
                } else if(cpcce76379_(l)/*[f]*/||(l.utf==8614/*[↦]*/)){
                    let mk = mark();
                    let anchor = l.copy();
                    /*67,2,1,66,2,1,73,2,1,62,3,1*/
                    /*31*/
                    if($fn$reduce_function(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                            if($fn$error_function(l,state)){
                                add_reduce(state,3,30);
                                state.prod = 31;
                                ACCEPT = true;
                            }
                        } else {
                            add_reduce(state,2,30);
                            state.prod = 31;
                            ACCEPT = true;
                        }
                    }
                    /*67,2,1,66,2,1,73,2,1,62,3,1*/
                    if(reset(mk,anchor,l,state,state.prod==31)){
                        state.prod = -1;
                        if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                            if($fn$error_function(l,state)){
                                add_reduce(state,2,34);
                                state.prod = 31;
                                ACCEPT = true;
                            }
                        }
                        /*67,2,1,66,2,1,73,2,1,62,3,1*/
                        if(reset(mk,anchor,l,state,state.prod==31)){
                            state.prod = -1;
                            if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                                if($fn$function_clause(l,state)){
                                    add_reduce(state,2,37);
                                    state.prod = 32;
                                    ACCEPT = true;
                                }
                            }
                        }
                    }
                } else if((((cpc9425d40_(l)/*[shift:]*/||cpdd70184b_(l)/*[assert:]*/)||l.isSym()/*[sym]*/)||false)||l.isID()/*[id]*/){
                    if($sym$symbol(l,state)){
                        add_reduce(state,2,37);
                        state.prod = 32;
                        ACCEPT = true;
                    }
                } else {
                    add_reduce(state,1,34);
                    state.prod = 31;
                    ACCEPT = true;
                }
                break;
            case 36:
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==123/*[{]*/)){
                    skip_fn_000(l/*[ nl ]*/);
                    if($fn$js_data(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if(assert_consume(l,state,l.utf==125/*[}]*/)){
                            add_reduce(state,4,52);
                            add_reduce(state,1,36);
                            state.prod = 32;
                            ACCEPT = true;
                        }
                    }
                } else if(assert_consume(l,state,l.utf==94/*[^]*/)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($def$id(l,state)){
                        add_reduce(state,3,53);
                        add_reduce(state,1,36);
                        state.prod = 32;
                        ACCEPT = true;
                    }
                }
                break;
            case 40:
                skip_fn_(l/*[ ws ][ nl ]*/);
                if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                    if($fn$error_function(l,state)){
                        add_reduce(state,2,33);
                        state.prod = 31;
                        ACCEPT = true;
                    }
                } else {
                    add_reduce(state,1,33);
                    state.prod = 31;
                    ACCEPT = true;
                }
                break;
            case 46:
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,cp723fc2c3_(l)/*[erh]*/)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if(assert_consume(l,state,l.utf==123/*[{]*/)){
                        skip_fn_000(l/*[ nl ]*/);
                        if($fn$js_data(l,state)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if(assert_consume(l,state,l.utf==125/*[}]*/)){
                                skip_fn_(l/*[ ws ][ nl ]*/);
                                if(assert_consume(l,state,l.utf==123/*[{]*/)){
                                    skip_fn_000(l/*[ nl ]*/);
                                    if($fn$js_data(l,state)){
                                        skip_fn_(l/*[ ws ][ nl ]*/);
                                        if(assert_consume(l,state,l.utf==125/*[}]*/)){
                                            add_reduce(state,8,48);
                                            add_reduce(state,1,35);
                                            state.prod = 31;
                                            ACCEPT = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if(cp5526201f_(l)/*[r] [return]*/||cp14d8f4e6_(l)/*[c] [cstr]*/){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($fn$reduce_function_group_013_101(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if(assert_consume(l,state,l.utf==123/*[{]*/)){
                            skip_fn_000(l/*[ nl ]*/);
                            if($fn$js_data(l,state)){
                                skip_fn_(l/*[ ws ][ nl ]*/);
                                if(assert_consume(l,state,l.utf==125/*[}]*/)){
                                    add_reduce(state,5,49);
                                    state.prod = 40;
                                    ACCEPT = true;
                                }
                            }
                        } else if(assert_consume(l,state,l.utf==94/*[^]*/)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if($def$id(l,state)){
                                add_reduce(state,4,50);
                                state.prod = 40;
                                ACCEPT = true;
                            }
                        } else if(assert_consume(l,state,cpc20f43f7_(l)/*[=>]*/)){
                            skip_fn_(l/*[ ws ][ nl ]*/);
                            if($def$id(l,state)){
                                add_reduce(state,4,51);
                                state.prod = 40;
                                ACCEPT = true;
                            }
                        }
                    }
                } else {
                    add_reduce(state,1,45);
                    state.prod = 36;
                    ACCEPT = true;
                }
                break;
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==31);
}
function $pb$body_entries(l,state){
    if(assert_consume(l,state,l.utf==91/*[[]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($pb$body_entries(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==93/*[]]*/)){
                add_reduce(state,3,38);
                state.prod = 32;
            }
        }
    } else if(l.utf==40/*[(]*/){
        let pk = l.copy();
        skip_fn_(pk.next()/*[ ws ][ nl ]*/);
        if((cpac314ec7_(pk)/*[RED] [RST]*/||cpa3161ff8_(pk)/*[IGN]*/)||cpd9ab2d28_(pk)/*[ERR] [EXC]*/){
            if($pb$condition_clause(l,state)){
                add_reduce(state,1,36);
                state.prod = 32;
            }
        } else {
            if($sym$symbol(l,state)){
                add_reduce(state,1,36);
                state.prod = 32;
            }
        }
    } else if(cpcce76379_(l)/*[f]*/||(l.utf==8614/*[↦]*/)){
        if($fn$function_clause(l,state)){
            add_reduce(state,1,36);
            state.prod = 32;
        }
    } else {
        if($sym$symbol(l,state)){
            add_reduce(state,1,36);
            state.prod = 32;
        }
    }
    while(state.prod==32){
        let ACCEPT = false;
        skip_fn_(l/*[ ws ][ nl ]*/);
        if((((l.utf==9474/*[│]*/)||cp7031a1c3_(l)/*[<>]*/)||cp7c689f5d_(l)/*[+>]*/)||assert_table(l,0x0,0x208,0x20000000,0x10000000)/*tbl:[ ] ] [ # ] [ | ] [ ) ]*/){
            break;
        }
        if(l.utf==40/*[(]*/){
            let pk = l.copy();
            skip_fn_(pk.next()/*[ ws ][ nl ]*/);
            if((cpac314ec7_(pk)/*[RED] [RST]*/||cpa3161ff8_(pk)/*[IGN]*/)||cpd9ab2d28_(pk)/*[ERR] [EXC]*/){
                if($pb$condition_clause(l,state)){
                    add_reduce(state,2,37);
                    state.prod = 32;
                    ACCEPT = true;
                }
            } else if(((((cpb00d90df_(pk)/*[$eof]*/||cpc9425d40_(pk)/*[shift:]*/)||cpdd70184b_(pk)/*[assert:]*/)||false)||pk.isID()/*[id]*/)||pk.isSym()/*[sym]*/){
                if($sym$symbol(l,state)){
                    add_reduce(state,2,37);
                    state.prod = 32;
                    ACCEPT = true;
                }
            }
        } else if(cpcce76379_(l)/*[f]*/||(l.utf==8614/*[↦]*/)){
            let mk = mark();
            let anchor = l.copy();
            /*73,2,1,62,3,1,66,2,1,67,2,1*/
            /*32*/
            if((l.utf==8614/*[↦]*/)||assert_table(l,0x0,0x0,0x0,0x40)/*tbl:[ f ]*/){
                if($fn$function_clause(l,state)){
                    add_reduce(state,2,37);
                    state.prod = 32;
                    ACCEPT = true;
                }
            }
            if(reset(mk,anchor,l,state,state.prod==32)){
                state.prod = 32;
            }
        } else if((((cpc9425d40_(l)/*[shift:]*/||cpdd70184b_(l)/*[assert:]*/)||l.isSym()/*[sym]*/)||false)||l.isID()/*[id]*/){
            if($sym$symbol(l,state)){
                add_reduce(state,2,37);
                state.prod = 32;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==32);
}
function $pb$force_fork(l,state){
    if(assert_consume(l,state,l.utf==40/*[(]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cpddb05f11_(l)/*[FORK]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==41/*[)]*/)){
                add_reduce(state,3,39);
                state.prod = 33;
            }
        }
    }
    return assertSuccess(l,state,state.prod==33);
}
function $pb$condition_clause(l,state){
    if(assert_consume(l,state,l.utf==40/*[(]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cpf2f5ccde_(l)/*[RED]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$symbol(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                    add_reduce(state,4,44);
                    state.prod = 34;
                }
            }
        } else if(assert_consume(l,state,cp852e887f_(l)/*[RST]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$condition_symbol_list(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                    add_reduce(state,4,43);
                    state.prod = 34;
                }
            }
        } else if(assert_consume(l,state,cp3c8dfde3_(l)/*[IGN]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$condition_symbol_list(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                    add_reduce(state,4,42);
                    state.prod = 34;
                }
            }
        } else if(assert_consume(l,state,cp5c8b4724_(l)/*[ERR]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$condition_symbol_list(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                    add_reduce(state,4,41);
                    state.prod = 34;
                }
            }
        } else if(assert_consume(l,state,cpeb1660e5_(l)/*[EXC]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($sym$condition_symbol_list(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                    add_reduce(state,4,40);
                    state.prod = 34;
                }
            }
        }
    }
    return assertSuccess(l,state,state.prod==34);
}
function $fn$referenced_function_group_05_100(l,state){
    if($fn$js_function_start_symbol(l,state)){
        add_reduce(state,1,45);
        state.prod = 36;
    }
    /*value*/
    return assertSuccess(l,state,state.prod==36);
}
function $fn$referenced_function(l,state){
    if($fn$referenced_function_group_05_100(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($sym$identifier(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==123/*[{]*/)){
                skip_fn_000(l/*[ nl ]*/);
                if($fn$js_data(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if(assert_consume(l,state,l.utf==125/*[}]*/)){
                        add_reduce(state,5,47);
                        state.prod = 37;
                    }
                }
            } else if(assert_consume(l,state,l.utf==94/*[^]*/)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($def$id(l,state)){
                    add_reduce(state,4,46);
                    state.prod = 37;
                }
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==37);
}
function $fn$error_function(l,state){
    if($fn$js_function_start_symbol(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp42ce3393_(l)/*[erh]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==123/*[{]*/)){
                skip_fn_000(l/*[ nl ]*/);
                if($fn$js_data(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if(assert_consume(l,state,l.utf==125/*[}]*/)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if(assert_consume(l,state,l.utf==123/*[{]*/)){
                            skip_fn_000(l/*[ nl ]*/);
                            if($fn$js_data(l,state)){
                                skip_fn_(l/*[ ws ][ nl ]*/);
                                if(assert_consume(l,state,l.utf==125/*[}]*/)){
                                    add_reduce(state,8,48);
                                    state.prod = 38;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==38);
}
function $fn$reduce_function_group_013_101(l,state){
    if(assert_consume(l,state,cp5c0ffb1b_(l)/*[r] [return]*/||cpbe69605d_(l)/*[c] [cstr]*/)){
        state.prod = 39;
    }
    return assertSuccess(l,state,state.prod==39);
}
function $fn$reduce_function(l,state){
    if($fn$js_function_start_symbol(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($fn$reduce_function_group_013_101(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,cpc20f43f7_(l)/*[=>]*/)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($def$id(l,state)){
                    add_reduce(state,4,51);
                    state.prod = 40;
                }
            } else if(assert_consume(l,state,l.utf==94/*[^]*/)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if($def$id(l,state)){
                    add_reduce(state,4,50);
                    state.prod = 40;
                }
            } else if(assert_consume(l,state,l.utf==123/*[{]*/)){
                skip_fn_000(l/*[ nl ]*/);
                if($fn$js_data(l,state)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if(assert_consume(l,state,l.utf==125/*[}]*/)){
                        add_reduce(state,5,49);
                        state.prod = 40;
                    }
                }
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==40);
}
function $fn$function_clause(l,state){
    if($fn$referenced_function_group_05_100(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,l.utf==94/*[^]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($def$id(l,state)){
                add_reduce(state,3,53);
                state.prod = 41;
            }
        } else if(assert_consume(l,state,l.utf==123/*[{]*/)){
            skip_fn_000(l/*[ nl ]*/);
            if($fn$js_data(l,state)){
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==125/*[}]*/)){
                    add_reduce(state,4,52);
                    state.prod = 41;
                }
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==41);
}
function $fn$js_data(l,state){
    if(assert_consume(l,state,cp31779bfd_(l)/*[ɛ]*/)){
        state.prod = 42;
    } else if(l.utf==123/*[{]*/){
        if($fn$js_data_block(l,state)){
            state.prod = 42;
        }
    } else {
        if($fn$js_primitive(l,state)){
            state.prod = 42;
        }
    }
    while(state.prod==42){
        let ACCEPT = false;
        skip_fn_000(l/*[ nl ]*/);
        if(l.utf==125/*[}]*/){
            break;
        }
        if(l.utf==123/*[{]*/){
            if($fn$js_data_block(l,state)){
                add_reduce(state,2,12);
                state.prod = 42;
                ACCEPT = true;
            }
        } else if((((cpb00d90df_(l)/*[$eof]*/||l.isSym()/*[sym]*/)||l.isSP()/*[ws]*/)||l.isNum()/*[num]*/)||l.isID()/*[id]*/){
            if($fn$js_primitive(l,state)){
                add_reduce(state,2,12);
                state.prod = 42;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==42);
}
function $fn$js_primitive_group_041_102(l,state){
    if(cpb00d90df_(l)/*[$eof]*/){
        if($sym$EOF_symbol(l,state)){
            state.prod = 43;
        }
    } else if(l.utf==92/*[\]*/){
        if($sym$escaped_symbol(l,state)){
            state.prod = 43;
        }
    } else if((l.utf==964/*[τ]*/)||assert_table(l,0x0,0x0,0x0,0x100000)/*tbl:[ t ]*/){
        if($sym$literal_symbol(l,state)){
            state.prod = 43;
        }
    } else {
        if($sym$generated_symbol(l,state)){
            state.prod = 43;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==43);
}
function $fn$js_primitive(l,state){
    if(((((cpb00d90df_(l)/*[$eof]*/||cpc2927e6c_(l)/*[t]*/)||cpd0b33b0f_(l)/*[τ]*/)||cpc296ddfa_(l)/*[g]*/)||cp04c2f086_(l)/*[θ]*/)||assert_table(l,0x0,0x0,0x10000000,0x0)/*tbl:[ \ ]*/){
        if($fn$js_primitive_group_041_102(l,state)){
            add_reduce(state,1,54);
            state.prod = 44;
        }
    } else if(assert_consume(l,state,((l.isSym()/*[sym]*/||l.isSP()/*[ws]*/)||l.isNum()/*[num]*/)||l.isID()/*[id]*/)){
        state.prod = 44;
    }
    /*value*/
    return assertSuccess(l,state,state.prod==44);
}
function $fn$js_data_block(l,state){
    if(assert_consume(l,state,l.utf==123/*[{]*/)){
        skip_fn_000(l/*[ nl ]*/);
        if($fn$js_data(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==125/*[}]*/)){
                add_reduce(state,3,55);
                state.prod = 45;
            }
        }
    }
    return assertSuccess(l,state,state.prod==45);
}
function $fn$js_function_start_symbol(l,state){
    if(assert_consume(l,state,l.utf==102/*[f]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,l.utf==58/*[:]*/)){
            add_reduce(state,2,57);
            state.prod = 46;
        }
    } else if(assert_consume(l,state,l.utf==8614/*[↦]*/)){
        add_reduce(state,1,56);
        state.prod = 46;
    }
    return assertSuccess(l,state,state.prod==46);
}
function $cm$cm(l,state){
    if(assert_consume(l,state,l.utf==35/*[#]*/)){
        skip_fn_000(l/*[ nl ]*/);
        if($cm$comment_data(l,state)){
            skip_fn_001(l/*[ ws ]*/);
            if($cm$comment_delimiter(l,state)){
                add_reduce(state,3,58);
                state.prod = 49;
            }
        }
    }
    return assertSuccess(l,state,state.prod==49);
}
function $cm$comment_delimiter(l,state){
    if(assert_consume(l,state,l.isNL()/*[nl]*/)){
        state.prod = 50;
    }
    return assertSuccess(l,state,state.prod==50);
}
function $cm$comment_data(l,state){
    if($cm$comment_primitive(l,state)){
        add_reduce(state,1,27);
        state.prod = 51;
    }
    while(state.prod==51){
        let ACCEPT = false;
        if(l.isNL()/*[nl]*/){
            break;
        }
        if(((l.isSP()/*[ws]*/||l.isNum()/*[num]*/)||l.isID()/*[id]*/)||l.isSym()/*[sym]*/){
            if($cm$comment_primitive(l,state)){
                add_reduce(state,2,12);
                state.prod = 51;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==51);
}
function $cm$comment_primitive(l,state){
    if(assert_consume(l,state,((l.isSP()/*[ws]*/||l.isNum()/*[num]*/)||l.isID()/*[id]*/)||l.isSym()/*[sym]*/)){
        state.prod = 52;
    }
    return assertSuccess(l,state,state.prod==52);
}
function $sym$condition_symbol_list(l,state){
    if($sym$terminal_symbol(l,state)){
        add_reduce(state,1,5);
        state.prod = 55;
    }
    while(state.prod==55){
        let ACCEPT = false;
        skip_fn_(l/*[ ws ][ nl ]*/);
        if((((cpc9425d40_(l)/*[shift:]*/||cpdd70184b_(l)/*[assert:]*/)||(l.utf==964/*[τ]*/))||(l.utf==952/*[θ]*/))||assert_table(l,0x0,0x0,0x10000000,0x100080)/*tbl:[ \ ] [ t ] [ g ]*/){
            if($sym$terminal_symbol(l,state)){
                add_reduce(state,2,4);
                state.prod = 55;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==55);
}
function $sym$ignore_symbols(l,state){
    if($sym$ignore_symbol(l,state)){
        add_reduce(state,1,5);
        state.prod = 59;
    }
    while(state.prod==59){
        let ACCEPT = false;
        skip_fn_001(l/*[ ws ]*/);
        if(l.isNL()/*[nl]*/){
            break;
        }
        if(((l.utf==964/*[τ]*/)||(l.utf==952/*[θ]*/))||assert_table(l,0x0,0x0,0x10000000,0x100080)/*tbl:[ \ ] [ t ] [ g ]*/){
            if($sym$ignore_symbol(l,state)){
                add_reduce(state,2,4);
                state.prod = 59;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==59);
}
function $sym$lexer_symbol(l,state){
    if(l.utf==92/*[\]*/){
        if($sym$escaped_symbol(l,state)){
            state.prod = 60;
        }
    } else if(cpc2927e6c_(l)/*[t]*/||cpd0b33b0f_(l)/*[τ]*/){
        if($sym$literal_symbol(l,state)){
            state.prod = 60;
        }
    } else if(cpc296ddfa_(l)/*[g]*/||cp04c2f086_(l)/*[θ]*/){
        if($sym$generated_symbol(l,state)){
            state.prod = 60;
        }
    } else {
        if($sym$grouped_symbol(l,state)){
            if($sym$grouped_delimiter(l,state)){
                add_reduce(state,2,59);
                state.prod = 60;
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==60);
}
function $sym$grouped_delimiter(l,state){
    if(assert_consume(l,state,l.isSP()/*[ws]*/||l.isNL()/*[nl]*/)){
        state.prod = 61;
    }
    return assertSuccess(l,state,state.prod==61);
}
function $sym$grouped_symbol_group_012_103(l,state){
    if(assert_consume(l,state,l.isID()/*[id]*/||l.isSym()/*[sym]*/)){
        state.prod = 62;
    }
    return assertSuccess(l,state,state.prod==62);
}
function $sym$grouped_symbol_HC_listbody1_104(l,state){
    if($sym$grouped_symbol_group_012_103(l,state)){
        add_reduce(state,1,13);
        state.prod = 63;
    }
    while(state.prod==63){
        let ACCEPT = false;
        if((cpb00d90df_(l)/*[$eof]*/||l.isSP()/*[ws]*/)||l.isNL()/*[nl]*/){
            break;
        }
        if(l.isID()/*[id]*/||l.isSym()/*[sym]*/){
            if($sym$grouped_symbol_group_012_103(l,state)){
                add_reduce(state,2,12);
                state.prod = 63;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==63);
}
function $sym$grouped_symbol(l,state){
    if($sym$grouped_symbol_HC_listbody1_104(l,state)){
        if((cpb00d90df_(l)/*[$eof]*/||l.isSP()/*[ws]*/)||l.isNL()/*[nl]*/){
            if($sym$sym_delimter(l,state)){
                add_reduce(state,2,59);
                state.prod = 64;
            }
        } else {
            add_reduce(state,1,59);
            state.prod = 64;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==64);
}
function $sym$ignore_symbol(l,state){
    if(l.utf==92/*[\]*/){
        if($sym$escaped_symbol(l,state)){
            state.prod = 65;
        }
    } else if((l.utf==964/*[τ]*/)||assert_table(l,0x0,0x0,0x0,0x100000)/*tbl:[ t ]*/){
        if($sym$literal_symbol(l,state)){
            state.prod = 65;
        }
    } else {
        if($sym$generated_symbol(l,state)){
            state.prod = 65;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==65);
}
function $sym$terminal_symbol(l,state){
    if(l.utf==92/*[\]*/){
        if($sym$escaped_symbol(l,state)){
            state.prod = 66;
        }
    } else if(cpc9425d40_(l)/*[shift:]*/||cpdd70184b_(l)/*[assert:]*/){
        if($sym$assert_function_symbol(l,state)){
            state.prod = 66;
        }
    } else if((l.utf==964/*[τ]*/)||assert_table(l,0x0,0x0,0x0,0x100000)/*tbl:[ t ]*/){
        if($sym$literal_symbol(l,state)){
            state.prod = 66;
        }
    } else {
        if($sym$generated_symbol(l,state)){
            state.prod = 66;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==66);
}
function $sym$symbol_group_030_105(l,state){
    if(assert_consume(l,state,cp1a9bf43b_(l)/*[(asterisk] [(+]*/)){
        state.prod = 67;
    }
    return assertSuccess(l,state,state.prod==67);
}
function $sym$symbol(l,state){
    if(assert_consume(l,state,l.utf==40/*[(]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($pb$production_bodies(l,state)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if(assert_consume(l,state,l.utf==41/*[)]*/)){
                add_reduce(state,3,60);
                state.prod = 68;
            }
        }
    } else if(l.utf==92/*[\]*/){
        if($sym$escaped_symbol(l,state)){
            state.prod = 68;
        }
    } else if(cpc9425d40_(l)/*[shift:]*/||cpdd70184b_(l)/*[assert:]*/){
        if($sym$assert_function_symbol(l,state)){
            state.prod = 68;
        }
    } else if(cpc2927e6c_(l)/*[t]*/||cpd0b33b0f_(l)/*[τ]*/){
        if($sym$literal_symbol(l,state)){
            state.prod = 68;
        }
    } else if(cpc296ddfa_(l)/*[g]*/||cp04c2f086_(l)/*[θ]*/){
        if($sym$generated_symbol(l,state)){
            state.prod = 68;
        }
    } else if(assert_consume(l,state,l.isSym()/*[sym]*/)){
        add_reduce(state,1,59);
        state.prod = 68;
    } else {
        if($def$js_id_symbols(l,state)){
            state.prod = 106;
        }
    }
    while(true){
        let ACCEPT = false;
        switch(state.prod){
            case 68:
                skip_fn_(l/*[ ws ][ nl ]*/);
                if(assert_consume(l,state,l.utf==63/*[?]*/)){
                    add_reduce(state,2,61);
                    state.prod = 68;
                    ACCEPT = true;
                } else if(cp1a9bf43b_(l)/*[(asterisk] [(+]*/){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($sym$symbol_group_030_105(l,state)){
                        skip_fn_(l/*[ ws ][ nl ]*/);
                        if(assert_consume(l,state,l.utf==41/*[)]*/)){
                            add_reduce(state,3,62);
                            state.prod = 68;
                            ACCEPT = true;
                        } else {
                            if($sym$terminal_symbol(l,state)){
                                skip_fn_(l/*[ ws ][ nl ]*/);
                                if(assert_consume(l,state,l.utf==41/*[)]*/)){
                                    add_reduce(state,4,62);
                                    state.prod = 68;
                                    ACCEPT = true;
                                }
                            }
                        }
                    }
                }
                break;
            case 82:
                if(assert_consume(l,state,cp1cfc201e_(l)/*[::]*/)){
                    skip_fn_(l/*[ ws ][ nl ]*/);
                    if($def$js_id_symbols(l,state)){
                        add_reduce(state,3,71);
                        state.prod = 68;
                        ACCEPT = true;
                    }
                } else {
                    add_reduce(state,1,70);
                    state.prod = 68;
                    ACCEPT = true;
                }
                break;
            case 106:
                if(assert_consume(l,state,(((((assert_table(l,0x0,0x10,0x80000000,0x0)/*tbl:[ _ ] [ $ ]*/||l.isID()/*[id]*/)||false)||l.isNum()/*[num]*/)||false)||false)||false)){
                    add_reduce(state,2,12);
                    state.prod = 106;
                    ACCEPT = true;
                } else {
                    state.prod = 82;
                    ACCEPT = true;
                }
                break;
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==68);
}
function $sym$EOF_symbol(l,state){
    if(assert_consume(l,state,cpb00d90df_(l)/*[$eof]*/)){
        add_reduce(state,1,63);
        state.prod = 69;
    }
    return assertSuccess(l,state,state.prod==69);
}
function $sym$empty_symbol(l,state){
    if(assert_consume(l,state,l.utf==603/*[ɛ]*/)){
        add_reduce(state,1,64);
        state.prod = 70;
    }
    return assertSuccess(l,state,state.prod==70);
}
function $sym$assert_function_symbol(l,state){
    if(assert_consume(l,state,cpc9425d40_(l)/*[shift:]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($def$js_id_symbols(l,state)){
            add_reduce(state,2,66);
            state.prod = 71;
        }
    } else if(assert_consume(l,state,cpdd70184b_(l)/*[assert:]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($def$js_id_symbols(l,state)){
            add_reduce(state,2,65);
            state.prod = 71;
        }
    }
    return assertSuccess(l,state,state.prod==71);
}
function $sym$generated_symbol_group_138_106(l,state){
    if(assert_consume(l,state,l.utf==103/*[g]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,l.utf==58/*[:]*/)){
            add_reduce(state,2,0);
            state.prod = 72;
        }
    } else if(assert_consume(l,state,l.utf==952/*[θ]*/)){
        state.prod = 72;
    }
    return assertSuccess(l,state,state.prod==72);
}
function $sym$generated_symbol(l,state){
    if($sym$generated_symbol_group_138_106(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($def$js_id_symbols(l,state)){
            add_reduce(state,2,67);
            state.prod = 73;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==73);
}
function $sym$literal_symbol_group_141_107(l,state){
    if(assert_consume(l,state,l.utf==116/*[t]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,l.utf==58/*[:]*/)){
            add_reduce(state,2,0);
            state.prod = 74;
        }
    } else if(assert_consume(l,state,l.utf==964/*[τ]*/)){
        state.prod = 74;
    }
    return assertSuccess(l,state,state.prod==74);
}
function $sym$literal_symbol_group_043_108(l,state){
    if(l.isNum()/*[num]*/){
        if($def$natural(l,state)){
            state.prod = 75;
        }
    } else {
        if($def$js_id_symbols(l,state)){
            state.prod = 75;
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==75);
}
function $sym$literal_symbol(l,state){
    if($sym$literal_symbol_group_141_107(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($sym$literal_symbol_group_043_108(l,state)){
            if((cpb00d90df_(l)/*[$eof]*/||l.isSP()/*[ws]*/)||l.isNL()/*[nl]*/){
                if($sym$sym_delimter(l,state)){
                    add_reduce(state,3,68);
                    state.prod = 76;
                }
            } else {
                add_reduce(state,2,68);
                state.prod = 76;
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==76);
}
function $sym$escaped_symbol_HC_listbody1_109(l,state){
    if($sym$grouped_symbol_group_012_103(l,state)){
        add_reduce(state,1,13);
        state.prod = 77;
    }
    while(state.prod==77){
        let ACCEPT = false;
        if((cpb00d90df_(l)/*[$eof]*/||l.isSP()/*[ws]*/)||l.isNL()/*[nl]*/){
            break;
        }
        if(l.isID()/*[id]*/||l.isSym()/*[sym]*/){
            if($sym$grouped_symbol_group_012_103(l,state)){
                add_reduce(state,2,12);
                state.prod = 77;
                ACCEPT = true;
            }
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==77);
}
function $sym$escaped_symbol(l,state){
    if(assert_consume(l,state,l.utf==92/*[\]*/)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if($sym$escaped_symbol_HC_listbody1_109(l,state)){
            if($sym$sym_delimter(l,state)){
                add_reduce(state,3,69);
                state.prod = 78;
            }
        }
    }
    return assertSuccess(l,state,state.prod==78);
}
function $sym$imported_production_symbol(l,state){
    if($def$js_id_symbols(l,state)){
        skip_fn_(l/*[ ws ][ nl ]*/);
        if(assert_consume(l,state,cp1cfc201e_(l)/*[::]*/)){
            skip_fn_(l/*[ ws ][ nl ]*/);
            if($def$js_id_symbols(l,state)){
                add_reduce(state,3,71);
                state.prod = 80;
            }
        }
    }
    /*value*/
    return assertSuccess(l,state,state.prod==80);
}
function $sym$identifier(l,state){
    if($def$js_id_symbols(l,state)){
        state.prod = 82;
    }
    /*value*/
    return assertSuccess(l,state,state.prod==82);
}
function $sym$sym_delimter(l,state){
    if(assert_consume(l,state,(cpb00d90df_(l)/*[$eof]*/||l.isNL()/*[nl]*/)||l.isSP()/*[ws]*/)){
        state.prod = 84;
    }
    return assertSuccess(l,state,state.prod==84);
}
function $def$natural(l,state){
    if(assert_consume(l,state,l.isNum()/*[num]*/)){
        state.prod = 96;
    }
    return assertSuccess(l,state,state.prod==96);
}
function $def$id(l,state){
    if(assert_consume(l,state,l.isID()/*[id]*/)){
        state.prod = 97;
    }
    return assertSuccess(l,state,state.prod==97);
}
function $def$js_id_symbols(l,state){
    if(assert_consume(l,state,(assert_table(l,0x0,0x10,0x80000000,0x0)/*tbl:[ $ ] [ _ ]*/||false)||l.isID()/*[id]*/)){
        state.prod = 106;
    }
    while(state.prod==106){
        let ACCEPT = false;
        if(((((l.utf==952/*[θ]*/)||(l.utf==964/*[τ]*/))||assert_table(l,0x0,0x0,0x0,0x1000c0)/*tbl:[ g ] [ t ] [ f ]*/)||l.isSP()/*[ws]*/)||l.isNL()/*[nl]*/){
            break;
        }
        if(assert_consume(l,state,(((((assert_table(l,0x0,0x10,0x80000000,0x0)/*tbl:[ $ ] [ _ ]*/||false)||false)||false)||l.isNum()/*[num]*/)||false)||l.isID()/*[id]*/)){
            add_reduce(state,2,12);
            state.prod = 106;
            ACCEPT = true;
        }
        if(!ACCEPT){
            break;
        }
    }
    return assertSuccess(l,state,state.prod==106);
}
function main(input_string){
    str = input_string;
    const l = new Lexer();
    const state = new State();
    l.next();
    reset_counters_and_pointers();
    $hydrocarbon(l,state);
    set_action(0);
    set_error(0);
    return state.getFAILED()||!l.END();
}
            return main;
        })
        (shared_memory, debug_stack),
    fns = [(e,sym)=>sym[sym.length-1], 
(env, sym, pos)=>( env.productions)/*0*/
,(env, sym, pos)=>( env.productions.meta={preambles:sym[0],pos})/*1*/
,(env, sym, pos)=>( env.productions.meta={pos})/*2*/
,(env, sym, pos)=>( ([...sym[0],sym[1]]))/*3*/
,(env, sym, pos)=>( [sym[0]])/*4*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbols";this.symbols=sym[2];}})(env, sym)/*5*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="precedence";this.terminal=sym[2];this.val=parseInt(sym[3]);}})(env, sym)/*6*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="ignore";this.symbols=sym[2];}})(env, sym)/*7*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="error";this.symbols=sym[2];}})(env, sym)/*8*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="name";this.id=sym[2];}})(env, sym)/*9*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="ext";this.id=sym[2];}})(env, sym)/*10*/
,(env, sym, pos)=>( sym[0]+sym[1])/*11*/
,(env, sym, pos)=>( sym[0]+"")/*12*/
,(env, sym, pos)=>( env.functions.importData(sym, env, pos))/*13*/
,(env, sym, pos)=>( (!(sym[0].IMPORT_OVERRIDE||sym[0].IMPORT_APPEND))?env.productions.push(sym[0]):0)/*14*/
,(env, sym, pos)=>( env.refs.set(sym[0].id,sym[0]),null)/*15*/
,(env, sym, pos)=>( sym[1].id=env.productions.length,(!(sym[1].IMPORT_OVERRIDE||sym[1].IMPORT_APPEND))?env.productions.push(sym[1]):0,env.productions)/*16*/
,(env, sym, pos)=>( env.refs.set(sym[1].id,sym[1]),sym[0])/*17*/
,(env, sym, pos)=>( env.prod_name=sym[0])/*18*/
,(env, sym, pos)=>( env.prod_name=sym[0].val,sym[0])/*19*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.name=sym[1];this.bodies=sym[3];this.id=-1;this.recovery_handler=sym[4];env.functions.compileProduction(this,env,pos);}})(env, sym)/*20*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IMPORT_OVERRIDE=true;this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*21*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IMPORT_APPEND=true;this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*22*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*23*/
,(env, sym, pos)=>( env.body_count++,[sym[0]])/*24*/
,(env, sym, pos)=>( env.body_count++,sym[0].push(sym[2]),sym[0])/*25*/
,(env, sym, pos)=>( sym[0])/*26*/
,(env, sym, pos)=>( new env.fn.body([sym[1]],env,pos,undefined,!!sym[0]))/*27*/
,(env, sym, pos)=>( new env.fn.body([sym[0]],env,pos,undefined,!!null))/*28*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=sym[0];this.reduce=sym[1];}})(env, sym)/*29*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=[];this.reduce=null;}})(env, sym)/*30*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.reduce=null;this.body=[sym[0]];}})(env, sym)/*31*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.reduce=sym[0];}})(env, sym)/*32*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=sym[0];}})(env, sym)/*33*/
,(env, sym)=>new (class{constructor(env, sym, pos){}})(env, sym)/*34*/
,(env, sym, pos)=>( env.body_offset=0,[sym[0]])/*35*/
,(env, sym, pos)=>( env.body_offset=sym[0].length,sym[0].push(sym[1]),sym[0])/*36*/
,(env, sym, pos)=>( env.no_blank_index++,sym[1].map(e=>(e.NO_BLANK=env.no_blank_index,e)))/*37*/
,(env, sym, pos)=>( true)/*38*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="exc";this.sym=sym[2];this.offset=-1;}})(env, sym)/*39*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="err";this.sym=sym[2];this.offset=-1;}})(env, sym)/*40*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="ign";this.sym=sym[2];this.offset=-1;}})(env, sym)/*41*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="rst";this.sym=sym[2];this.offset=-1;}})(env, sym)/*42*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="red";this.sym=sym[2];this.offset=-1;}})(env, sym)/*43*/
,(env, sym, pos)=>( sym[0]+"GG")/*44*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.id=sym[1];this.name=sym[3];this.txt="";this.env=true;this.IS_CONDITION=true;}})(env, sym)/*45*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.id=sym[1];this.txt=sym[3];this.env=false;this.name="";this.IS_CONDITION=true;}})(env, sym)/*46*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="ERROR_RECOVERY";this.lexer_text=sym[3];this.body_text=sym[6];}})(env, sym)/*47*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.txt=sym[3];this.name="";this.env=false;this.ref="";this.IS_CONDITION=true;}})(env, sym)/*48*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.txt="";this.name=sym[3];this.env=true;this.ref="";this.IS_CONDITION=true;}})(env, sym)/*49*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.ref=sym[3];this.txt="";this.name="";this.env=true;this.IS_CONDITION=true;const ref=env.refs.get(this.ref);if(ref){if(Array.isArray(ref)){ref.push(this);}else {let ref=env.refs.get(this.ref);this.env=ref.env;this.name=ref.name;this.txt=ref.txt;}}else {env.refs.set(this.ref,[this]);}}})(env, sym)/*50*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="INLINE";this.txt=sym[2];this.name="";this.env=false;this.IS_CONDITION=true;}})(env, sym)/*51*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="INLINE";this.txt="";this.name=sym[2];this.env=true;this.IS_CONDITION=true;}})(env, sym)/*52*/
,(env, sym, pos)=>( "<--"+sym[0].type+"^^"+sym[0].val+"-->")/*53*/
,(env, sym, pos)=>( sym[0]+sym[1]+sym[2])/*54*/
,(env, sym, pos)=>( "FN->")/*55*/
,(env, sym, pos)=>( "FN:F")/*56*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.val=sym[1];}})(env, sym)/*57*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbol";this.val=sym[0];this.pos=pos;env.symbols.push(this);}})(env, sym)/*58*/
,(env, sym, pos)=>( new env.functions.groupProduction(sym, env, pos))/*59*/
,(env, sym, pos)=>( sym[0].IS_OPTIONAL=true,sym[0])/*60*/
,(env, sym, pos)=>( new env.functions.listProduction(sym, env, pos))/*61*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="eof";this.val="END_OF_FILE";this.pos=pos;env.symbols.push(this);}})(env, sym)/*62*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="empty";this.pos=pos;env.symbols.push(this);}})(env, sym)/*63*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="assert_token_function";this.pos=pos;this.DOES_SHIFT=false;}})(env, sym)/*64*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="assert_token_function";this.pos=pos;this.DOES_SHIFT=true;}})(env, sym)/*65*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="generated";this.val=sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*66*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="literal";this.val=""+sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*67*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbol";this.val=sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*68*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="production";this.name=sym[0];this.val=-1;this.pos=pos;}})(env, sym)/*69*/
,(env, sym, pos)=>( new env.functions.importProduction(sym, env, pos))/*70*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"hex",original_val:sym[0]})/*71*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"bin",original_val:sym[0]})/*72*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"oct",original_val:sym[0]})/*73*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"sci",original_val:sym[0]})/*74*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"flt",original_val:sym[0]})/*75*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"int",original_val:sym[0]})/*76*/
,(env, sym, pos)=>( sym[1])/*77*/];

 
    
    return function (str, env = {}) {
        
        const 
            FAILED = recognizer(str), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];
    
        let action_length = 0;

        //console.log({FAILED})
    
        if (FAILED) {

            //console.log({ds:debug_stack.length})

            const review_stack = [];

            for(let i = debug_stack.length-1, j=0; i >= 0; i--){
                if(!debug_stack[i].FAILED && j++ > 80)
                    break;
                review_stack.push(debug_stack[i]);
            }

            //console.log({review_stack:review_stack.reverse()})
            
            let error_off = 10000000000000;
            let error_set = false;


            const lexer = new Lexer(str);
            const probes = [];
            //Extract any probes

            //console.log("ERROR_LENGTH", er)
            for (let i = 0; i < er.length; i++) {
                if(er[i]>0 && !error_set){
                    error_set = true;
                    error_off = Math.max(error_off, er[i]);
                }
            }

            if(error_off == 10000000000000)
            error_off = 0;

            while (lexer.off < error_off && !lexer.END) lexer.next();
            if(probes.length >0)
                console.table(probes);
            //console.log("", error_off, str.length);
            console.log(lexer.errorMessage(`Unexpected token[${ lexer.tx }]`));
    
        } /*else {*/

            let offset = 0, pos = [];

            for (const action of aa) {

                action_length++;
                let prev_off = 0;

                if (action == 0) break;

                switch (action & 1) {
                    case 0: //REDUCE;
                        {
                            const
                                DO_NOT_PUSH_TO_STACK = (action >> 1) & 1,
                                body = action >> 16,
                                len = ((action >> 2) & 0x3FFF);

                            const pos_a = pos[pos.length - len] || {off:0,tl:0};
                            const pos_b = pos[pos.length - 1 ] || {off:0,tl:0};
                            pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off  + pos_b.tl };

                            stack[stack.length - len] = fns[body](env, stack.slice(-len), { off: pos_a.off, tl: pos_b.off - pos_a.off  + pos_b.tl });

                            if (!DO_NOT_PUSH_TO_STACK) {
                                stack.length = stack.length - len + 1;
                                pos.length = pos.length - len + 1;
                            } else {
                                stack.length = stack.length - len;
                                pos.length = pos.length - len;
                            }
                            // console.log(pos);

                        } break;

                    case 1: { //SHIFT;
                        const
                            has_len = (action >>> 1) & 1,
                            has_skip = (action >>> 2) & 1,
                            len = action >>> (3 + (has_skip * 15)),
                            skip = has_skip * ((action >>> 3) & (~(has_len * 0xFFFF8000)));
                        offset += skip;
                        if (has_len) {
                            stack.push(str.slice(offset, offset + len));
                            pos.push({ off: offset, tl: len });
                            offset += len;
                        }else {
                            stack.push("");
                            pos.push({ off: offset, tl: 0 });
                        }
                    } break;
                }
            }
            //console.log({aa,er})
        //}
    
        return { result: stack, FAILED: !!FAILED, action_length };
    }
     