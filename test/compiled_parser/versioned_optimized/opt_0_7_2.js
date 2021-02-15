import { buildParserMemoryBuffer, loadWASM } from "@candlefw/hydrocarbon";
import Lexer from "@candlefw/wind";

const debug_stack = [];
const { shared_memory, action_array, error_array } = buildParserMemoryBuffer(true, 4194304, 163920);

const recognizer =
    ((store_data, debug_stack) => {
        const data_view = new DataView(store_data);
        function load(offset) {
            return data_view.getUint16(offset, true);
        };
        function store(offset, val) {
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
        function createState(ENABLE_STACK_OUTPUT) {
            const IS_STATE_VALID = 1;
            return IS_STATE_VALID | (ENABLE_STACK_OUTPUT << 1);
        }
        function hasStateFailed(state) {
            const IS_STATE_VALID = 1;
            return 0 == (state & IS_STATE_VALID);
        }
        function isOutputEnabled(state) {
            return 0 < (state & 0x2);
        }
        function getTypeAt(code_point) {
            switch (load(code_point << 1) & 255) {
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
            constructor() {
                this.ty = 0;
                this.tl = 0;
                this.off = 0;
                this.utf = 0;
                this.prev_off = 0;
            }
            copy(destination = new Lexer()) {
                destination.utf = this.utf;
                destination.ty = this.ty;
                destination.tl = this.tl;
                destination.off = this.off;
                destination.prev_off = this.prev_off;
                return destination;
            }
            sync(marker = new Lexer()) {
                marker.copy(this);
            }
            isSym() {
                return this.ty == TokenSymbol;
            }
            isNL() {
                return this.ty == TokenNewLine;
            }
            isSP() {
                return this.ty == TokenSpace;
            }
            isNum() {
                if (this.ty == TokenNumber) {
                    this.consumeNumeric();
                    return true;
                }
                return false;
            }
            isID() {
                if (this.ty == TokenIdentifier) {
                    this.consumeIdentifier();
                    return true;
                }
                return false;
            }
            typeIs(flag) {
                return (this.ty & flag) == this.ty;
            }
            consumeNumeric() {
                const l = str.length;
                let off = this.off;
                this.tl = 1;
                while ((++off < l) && (num & (load(0 + (str.codePointAt(off) << 1)) >> 8))) {
                    this.tl++;
                }
            }
            consumeIdentifier() {
                const l = str.length;
                let off = this.off;
                this.tl = 1;
                while ((++off < l) && ((num | id) & (load(0 + (str.codePointAt(off) << 1)) >> 8))) {
                    this.tl++;
                }
            }
            getUTF(delta = 0) {
                return str.codePointAt(this.off + delta);
            }
            getOffsetRegionDelta() {
                return this.off - this.prev_off;
            }
            advanceOffsetRegion() {
                this.prev_off = this.off + this.tl;
            }
            syncOffsetRegion() {
                this.prev_off = this.off;
            }
            typeAt(offset = 0) {
                offset = this.off + offset;
                if (offset >= str.length) {
                    return 0;
                }
                return getTypeAt(str.codePointAt(offset));
            }
            next() {
                this.off = this.off + this.tl;
                this.tl = 1;
                if (this.off >= str.length) {
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
            END() {
                return this.off >= str.length;
            }
        }
        function comment_tok_5bd84591a5ef9bdc(l) {
            if (defined_token_88fe0e82e8d7b114(l)/*[/asterisk]*/) {
                let c = l.copy();
                if ($comment(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$binary_token_tok_0dd6a5d8776a65dc(l) {
            if (defined_token_33b1e9553bafe159(l)/*[0b]*/) {
                let c = l.copy();
                if ($def$binary_token(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$hex_token_tok_1118cc1504233a17(l) {
            if (defined_token_60c8247a60511d72(l)/*[0x]*/) {
                let c = l.copy();
                if ($def$hex_token(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$identifier_symbols_tok_cb43c29328476df0(l) {
            if (((l.utf == 95/*[_]*/) || (l.utf == 36/*[$]*/)) || l.isID()/*[id]*/) {
                let c = l.copy();
                if ($def$identifier_symbols(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$js_id_symbols_tok_b3199095c9facd2b(l) {
            if (((l.utf == 95/*[_]*/) || (l.utf == 36/*[$]*/)) || l.isID()/*[id]*/) {
                let c = l.copy();
                if ($def$js_id_symbols(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$octal_token_tok_d4c33e0f61b14fb0(l) {
            if (defined_token_ad665389bc23e01f(l)/*[0o] [0O]*/) {
                let c = l.copy();
                if ($def$octal_token(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function def$scientific_token_tok_55f659f8323305af(l) {
            if (l.isNum()/*[num]*/) {
                let c = l.copy();
                if ($def$scientific_token(c, createState(0))) {
                    l.tl = c.off - l.off;
                    return true;
                }
            }
            return false;
        }
        function defined_token_0c3be902c24e826c(l) {
            let ACCEPT = false;
            let val = 0;
            if (l.getUTF(0) == 48) {
                val = l.getUTF(1);
                if (val == 98) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                } else if (val == 111) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                } else if (val == 79) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                } else if (val == 120) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                }
            }
            return ACCEPT;
        }
        function defined_token_0ca2cff5a3c99027(l) {
            let ACCEPT = false;
            if ((l.getUTF(2) != 109) && ((l.getUTF(1) == 47) && (l.getUTF(0) == 42))) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_33b1e9553bafe159(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 98) && (l.getUTF(0) == 48)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_498c462f670f746c(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 61) && (l.getUTF(0) == 62)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_60c8247a60511d72(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 120) && (l.getUTF(0) == 48)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_66606a6e3bc4e858(l) {
            let ACCEPT = false;
            if (((((l.getUTF(4) == 101) && (l.getUTF(3) == 98)) && (l.getUTF(2) == 121)) && (l.getUTF(1) == 97)) && (l.getUTF(0) == 109)) {
                l.ty = TokenSymbol;
                l.tl = 5;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_67a732a27c736a2f(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 43) && (l.getUTF(0) == 43)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_6d4f77707d3e0e5a(l) {
            let ACCEPT = false;
            if ((l.getUTF(2) != NaN) && ((l.getUTF(1) == 43) && (l.getUTF(0) == 43))) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_6e58d2029f2d4e4a(l) {
            let ACCEPT = false;
            if ((((l.getUTF(3) == 110) && (l.getUTF(2) == 101)) && (l.getUTF(1) == 104)) && (l.getUTF(0) == 116)) {
                l.ty = TokenSymbol;
                l.tl = 4;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_70d91b687222e5ae(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) != 121) && (l.getUTF(0) == 34)) {
                l.ty = TokenSymbol;
                l.tl = 1;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_7c714fc2ee65a23e(l) {
            let ACCEPT = false;
            if ((((l.getUTF(3) == 101) && (l.getUTF(2) == 115)) && (l.getUTF(1) == 108)) && (l.getUTF(0) == 101)) {
                l.ty = TokenSymbol;
                l.tl = 4;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_88fe0e82e8d7b114(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 42) && (l.getUTF(0) == 47)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_911b730840de3b6c(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 102) && (l.getUTF(0) == 105)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_97485949e321ad2b(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) != 121) && (l.getUTF(0) == 92)) {
                l.ty = TokenSymbol;
                l.tl = 1;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_a7d1889f903e4d81(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 114) && (l.getUTF(0) == 111)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_ad665389bc23e01f(l) {
            let ACCEPT = false;
            let val = 0;
            if (l.getUTF(0) == 48) {
                val = l.getUTF(1);
                if (val == 111) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                } else if (val == 79) {
                    l.ty = TokenSymbol;
                    l.tl = 2;
                    ACCEPT = true;
                }
            }
            return ACCEPT;
        }
        function defined_token_b2fe121993c428ee(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 62) && (l.getUTF(0) == 61)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_c1fd3ef6c0b69274(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 47) && (l.getUTF(0) == 42)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_dcd094f052938e12(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) != 121) && (l.getUTF(0) == 39)) {
                l.ty = TokenSymbol;
                l.tl = 1;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_fe70b6f5a727a201(l) {
            let ACCEPT = false;
            if ((l.getUTF(1) == 45) && (l.getUTF(0) == 45)) {
                l.ty = TokenSymbol;
                l.tl = 2;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function defined_token_ff317a5334168f4a(l) {
            let ACCEPT = false;
            if (((((((l.getUTF(6) == 101) && (l.getUTF(5) == 116)) && (l.getUTF(4) == 97)) && (l.getUTF(3) == 118)) && (l.getUTF(2) == 105)) && (l.getUTF(1) == 114)) && (l.getUTF(0) == 112)) {
                l.ty = TokenSymbol;
                l.tl = 7;
                ACCEPT = true;
            }
            return ACCEPT;
        }
        function sk_23a22f95a8335fa5(l) {
            while (1) {
                if (!(comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_2c735215b109fb1d(l) {
            while (1) {
                if (!((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_31d5c6f155126dd5(l) {
            while (1) {
                if (!((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_4795467680137b7c(l) {
            while (1) {
                if (!(comment_tok_5bd84591a5ef9bdc(l))) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_72712f05fd3b2441(l) {
            while (1) {
                if (!(((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_8ab5cd505e6df373(l) {
            while (1) {
                if (!(comment_tok_5bd84591a5ef9bdc(l) || l.isNum()/*[num]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_8c59dafe191078c6(l) {
            while (1) {
                if (!(comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_a1c939e8cbd4ccbf(l) {
            while (1) {
                if (!(((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_d65553ab16af0339(l) {
            while (1) {
                if (!((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_ea0b808ad54b3f8b(l) {
            while (1) {
                if (!(((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_eb6967af44fd1f5d(l) {
            while (1) {
                if (!((comment_tok_5bd84591a5ef9bdc(l) || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function sk_fc3fdb866be49cf6(l) {
            while (1) {
                if (!((l.isNL()/*[nl]*/ || l.isNum()/*[num]*/) || l.isSP()/*[ws]*/)) {
                    break;
                }
                l.next();
            }
            return l;
        }
        function set_error(val) {
            if (error_ptr >= 40980) {
                return;
            }
            store((error_ptr++ << 2) + error_array_offset, val);
        }
        function set_action(val) {
            store((action_ptr++ << 2) + action_array_offset, val);
        }
        function mark() {
            return action_ptr;
        }
        function assert_table(l, a, b, c, d) {
            const utf = l.utf;
            if (utf < 32) {
                return (a & (1 << utf)) != 0;
            } else if (utf < 64) {
                return (b & (1 << (utf - 32))) != 0;
            } else if (utf < 96) {
                return (c & (1 << (utf - 64))) != 0;
            } else if (utf < 128) {
                return (d & (1 << (utf - 96))) != 0;
            }
            return false;
        }
        function reset(mark, origin, advanced, state) {
            action_ptr = mark;
            advanced.sync(origin);
            return state;
        }
        function add_shift(l, char_len) {
            const skip_delta = l.getOffsetRegionDelta();
            let has_skip = skip_delta > 0;
            let has_len = char_len > 0;
            let val = 1;
            val |= (skip_delta << 3);
            if (has_skip && ((skip_delta > 36863) || (char_len > 36863))) {
                add_shift(l, 0);
                has_skip = 0;
                val = 1;
            }
            val |= (((has_skip << 2) | (has_len << 1)) | (char_len << (3 + (15 * has_skip))));
            set_action(val);
            l.advanceOffsetRegion();
        }
        function add_reduce(state, sym_len, body, DNP = false) {
            if (isOutputEnabled(state)) {
                set_action(((DNP << 1) | ((sym_len & 16383) << 2)) | (body << 16));
            }
        }
        function fail(l, state) {
            if (!hasStateFailed(state) && isOutputEnabled(state)) {
                soft_fail(l, state);
            }
            return 0;
        }
        function soft_fail(l, state) {
            set_error(l.off);
        }
        function assertSuccess(l, state, condition) {
            if (!condition || hasStateFailed(state)) {
                return fail(l, state);
            }
            return state;
        }
        function consume(l, state) {
            if (isOutputEnabled(state)) {
                add_shift(l, l.tl);
            }
            l.next();
        }
        function consume_empty(l) {
            add_shift(l, 0);
        }
        function assert_consume(l, state, accept) {
            if (hasStateFailed(state)) {
                return 0;
            }
            if (accept) {
                consume(l, state);
                return state;
            } else {
                return 0;
            }
        }
        function reset_counters_and_pointers() {
            error_ptr = 0;
            action_ptr = 0;
        }
/*production name: start
            grammar index: 0
            bodies:
	0:0 start=>• blocks - 
            compile time: 4.087ms*/;
        function $start(l, state) {
            debug_stack.push({ name: "start RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $blocks(l, state)) {
                /*--unique-id--0--DO-NOT-REPLACE*/
                debug_stack.push({ name: "start RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "start RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: blocks_group_22_100
            grammar index: 1
            bodies:
	1:1 blocks_group_22_100=>• [ expressions ] - 
		1:2 blocks_group_22_100=>• [ ] - 
            compile time: 8.716ms*/;
        function $blocks_group_22_100(l, state) {
            debug_stack.push({ name: "blocks_group_22_100 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, l.utf == 91/*[[]*/)) {
                /*consume*/
                /*
                   1:1 blocks_group_22_100=>[ • expressions ]
                   1:2 blocks_group_22_100=>[ • ]
                */
                sk_2c735215b109fb1d(l/*[ ws ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 93/*[]]*/)) {
                    /*consume*/
                    /*
                       1:2 blocks_group_22_100=>[ ] •
                    */
                    /*--unique-id--1--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "blocks_group_22_100 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                } else {
                    /*peek-production-closure*/
                    /*
                       1:1 blocks_group_22_100=>[ • expressions ]
                    */
                    if (state = $expressions(l, state)) {
                        sk_ea0b808ad54b3f8b(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, l.utf == 93/*[]]*/)) {
                            /*--unique-id--1--DO-NOT-REPLACE*/
                            add_reduce(state, 3, 0);
                            debug_stack.push({ name: "blocks_group_22_100 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                            return state;
                        }
                    }
                }
            }
            debug_stack.push({ name: "blocks_group_22_100 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: blocks
            grammar index: 3
            bodies:
	3:5 blocks=>• blocks & blocks_group_22_100 - 
		3:6 blocks=>• blocks_group_22_100 - 
            compile time: 4.259ms*/;
        function $blocks(l, state) {
            debug_stack.push({ name: "blocks RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $blocks_group_22_100(l, state)) {
                /*--unique-id--3--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $blocks_goto(l, state, 3);
            }
            debug_stack.push({ name: "blocks RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $blocks_goto(l, state, prod) {
            debug_stack.push({ name: "blocks GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 38/*[&]*/)) {
                    /*consume*/
                    /*
                       3:5 blocks=>blocks & • blocks_group_22_100
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (state = $blocks_group_22_100(l, state)) {
                        /*--unique-id--3--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 1);
                        prod = 3;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "blocks GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 3);
        }
/*production name: expressions
            grammar index: 5
            bodies:
	5:9 expressions=>• expressions , expression - 
		5:10 expressions=>• expression - 
            compile time: 6.829ms*/;
        function $expressions(l, state) {
            debug_stack.push({ name: "expressions RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $expression(l, state)) {
                /*--unique-id--5--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $expressions_goto(l, state, 5);
            }
            debug_stack.push({ name: "expressions RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $expressions_goto(l, state, prod) {
            debug_stack.push({ name: "expressions GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 44/*[,]*/)) {
                    /*consume*/
                    /*
                       5:9 expressions=>expressions , • expression
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (state = $expression(l, state)) {
                        /*--unique-id--5--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 1);
                        prod = 5;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "expressions GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 5);
        }
/*production name: expression
            grammar index: 6
            bodies:
	6:11 expression=>• id_sequence - 
		6:12 expression=>• math_expression - 
            compile time: 34.166ms*/;
        function $expression(l, state) {
            debug_stack.push({ name: "expression RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (((((defined_token_67a732a27c736a2f(l)/*[++]*/ || defined_token_fe70b6f5a727a201(l)/*[--]*/) || defined_token_0c3be902c24e826c(l)/*[0b] [0o] [0O] [0x]*/) || (l.utf == 40/*[(]*/)) || (l.utf == 91/*[[]*/)) || l.isNum()/*[num]*/) {
                /*peek-production-closure*/
                /*
                   6:12 expression=>• math_expression
                */
                if (state = $additive(l, state)) {
                    /*--unique-id--6--DO-NOT-REPLACE*/
                    return $expression_goto(l, state, 6);
                }
            } else {
                /*assert-production-closure*/
                /*
                   55:150 def$js_identifier=>• tk:def$js_id_symbols
                */
                if (state = $def$js_identifier(l, state)) {
                    /*--unique-id--20--DO-NOT-REPLACE*/
                    return $expression_goto(l, state, 20);
                }
            }
            debug_stack.push({ name: "expression RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $expression_goto(l, state, prod) {
            debug_stack.push({ name: "expression GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                switch (prod) {
                    case 8:
                        sk_eb6967af44fd1f5d(l/*[ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, l.isSP()/*[ws]*/)) {
                            /*consume*/
                            /*
                               8:15 id_sequence=>id_sequence θws • identifier
                            */
                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (state = $def$js_identifier(l, state)) {
                                /*--unique-id--8--DO-NOT-REPLACE*/
                                add_reduce(state, 3, 1);
                                prod = 8;
                                continue;
                            }
                        } else {
                            /*assert-end*/
                            /*
                               6:11 expression=>id_sequence •
                            */
                            /*--unique-id--6--DO-NOT-REPLACE*/
                            prod = 6;
                            continue;
                        }
                        break;
                    case 11:
                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, l.utf == 43/*[+]*/)) {
                            /*consume*/
                            /*
                               10:18 additive=>multiplicative + • additive
                            */
                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (state = $additive(l, state)) {
                                /*--unique-id--6--DO-NOT-REPLACE*/
                                add_reduce(state, 3, 0);
                                prod = 6;
                                continue;
                            }
                        } else {
                            /*assert-end*/
                            /*
                               10:19 additive=>multiplicative •
                            */
                            /*--unique-id--6--DO-NOT-REPLACE*/
                            prod = 6;
                            continue;
                        }
                        break;
                    case 12:
                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, l.utf == 43/*[+]*/)) {
                            /*consume*/
                            /*
                               11:20 multiplicative=>unary + • additive
                            */
                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (state = $additive(l, state)) {
                                /*--unique-id--11--DO-NOT-REPLACE*/
                                add_reduce(state, 3, 0);
                                prod = 11;
                                continue;
                            }
                        } else {
                            /*assert-end*/
                            /*
                               11:21 multiplicative=>unary •
                            */
                            /*--unique-id--11--DO-NOT-REPLACE*/
                            prod = 11;
                            continue;
                        }
                        break;
                    case 13:
                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, defined_token_fe70b6f5a727a201(l)/*[--]*/ || defined_token_6d4f77707d3e0e5a(l)/*[++]*/)) {
                            /*consume*/
                            /*
                               12:24 unary=>closure -- •
                               12:25 unary=>closure ++ •
                            */
                            /*--unique-id--12--DO-NOT-REPLACE*/
                            add_reduce(state, 2, 0);
                            prod = 12;
                            continue;
                        } else {
                            /*assert-end*/
                            /*
                               12:26 unary=>closure •
                            */
                            /*--unique-id--12--DO-NOT-REPLACE*/
                            prod = 12;
                            continue;
                        }
                        break;
                    case 20:
                        sk_eb6967af44fd1f5d(l/*[ num ][ 23 ][ nl ]*/);
                        if (defined_token_b2fe121993c428ee(l)/*[=>]*/) {
                            /*peek*/
                            /*
                               14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                               16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                            */
                            let pk = l.copy();
                            sk_a1c939e8cbd4ccbf(pk.next()/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (def$js_id_symbols_tok_b3199095c9facd2b(pk) || pk.END()) {
                                /*peek-production-closure*/
                                /*
                                   16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                                */
                                if (state = $fnB_group_026_104(l, state)) {
                                    sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $def$js_identifier(l, state)) {
                                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (state = $reserved_word(l, state)) {
                                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (assert_consume(l, state, false)) {
                                                sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                                if (state = $blocks(l, state)) {
                                                    /*--unique-id--13--DO-NOT-REPLACE*/
                                                    add_reduce(state, 6, 0);
                                                    prod = 13;
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (((pk.utf == 95/*[_]*/) || (pk.utf == 36/*[$]*/)) || pk.isID()/*[id]*/) {
                                /*peek*/
                                /*
                                   14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                                */
                                if (assert_consume(l, state, defined_token_b2fe121993c428ee(l)/*[=>]*/)) {
                                    sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $def$js_identifier(l, state)) {
                                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (state = $reserved_word(l, state)) {
                                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (assert_consume(l, state, false)) {
                                                sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                                if (state = $blocks(l, state)) {
                                                    /*--unique-id--13--DO-NOT-REPLACE*/
                                                    add_reduce(state, 6, 0);
                                                    prod = 13;
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (defined_token_498c462f670f746c(l)/*[>=]*/) {
                            /*peek-production-closure*/
                            /*
                               16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                            */
                            if (state = $fnB_group_026_104(l, state)) {
                                sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                if (state = $def$js_identifier(l, state)) {
                                    sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $reserved_word(l, state)) {
                                        sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (assert_consume(l, state, false)) {
                                            sk_a1c939e8cbd4ccbf(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (state = $blocks(l, state)) {
                                                /*--unique-id--13--DO-NOT-REPLACE*/
                                                add_reduce(state, 6, 0);
                                                prod = 13;
                                                continue;
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (l.isSP()/*[ws]*/) {
                            /*assert-end*/
                            /*
                               8:16 id_sequence=>identifier •
                            */
                            /*--unique-id--8--DO-NOT-REPLACE*/
                            add_reduce(state, 1, 2);
                            prod = 8;
                            continue;
                        } else {
                            /*assert-end*/
                            /*
                               17:37 literal=>identifier •
                            */
                            /*--unique-id--13--DO-NOT-REPLACE*/
                            prod = 13;
                            continue;
                        }
                        break;
                }
                break;
            }
            debug_stack.push({ name: "expression GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 6);
        }
/*production name: additive
            grammar index: 10
            bodies:
	10:18 additive=>• multiplicative + additive - 
		10:19 additive=>• multiplicative - 
            compile time: 4.986ms*/;
        function $additive(l, state) {
            debug_stack.push({ name: "additive RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $multiplicative(l, state)) {
                /*assert*/
                /*
                   10:18 additive=>• multiplicative + additive
                   10:19 additive=>• multiplicative
                */
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 43/*[+]*/)) {
                    /*consume*/
                    /*
                       10:18 additive=>multiplicative + • additive
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (state = $additive(l, state)) {
                        /*--unique-id--10--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 0);
                        debug_stack.push({ name: "additive RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*
                       10:19 additive=>multiplicative •
                    */
                    /*--unique-id--10--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "additive RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "additive RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: multiplicative
            grammar index: 11
            bodies:
	11:20 multiplicative=>• unary + additive - 
		11:21 multiplicative=>• unary - 
            compile time: 3.334ms*/;
        function $multiplicative(l, state) {
            debug_stack.push({ name: "multiplicative RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $unary(l, state)) {
                /*assert*/
                /*
                   11:20 multiplicative=>• unary + additive
                   11:21 multiplicative=>• unary
                */
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 43/*[+]*/)) {
                    /*consume*/
                    /*
                       11:20 multiplicative=>unary + • additive
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (state = $additive(l, state)) {
                        /*--unique-id--11--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 0);
                        debug_stack.push({ name: "multiplicative RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*
                       11:21 multiplicative=>unary •
                    */
                    /*--unique-id--11--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "multiplicative RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "multiplicative RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: unary
            grammar index: 12
            bodies:
	12:22 unary=>• ++ closure - 
		12:23 unary=>• -- closure - 
		12:24 unary=>• closure -- - 
		12:25 unary=>• closure ++ - 
		12:26 unary=>• closure - 
            compile time: 13.767ms*/;
        function $unary(l, state) {
            debug_stack.push({ name: "unary RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_67a732a27c736a2f(l)/*[++]*/ || defined_token_fe70b6f5a727a201(l)/*[--]*/)) {
                /*consume*/
                /*
                   12:22 unary=>++ • closure
                   12:23 unary=>-- • closure
                */
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (state = $closure(l, state)) {
                    /*--unique-id--12--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "unary RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            } else {
                /*peek-production-closure*/
                /*
                   12:24 unary=>• closure --
                   12:25 unary=>• closure ++
                   12:26 unary=>• closure
                */
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (state = $closure(l, state)) {
                    /*assert*/
                    /*
                       12:24 unary=>• closure --
                       12:25 unary=>• closure ++
                       12:26 unary=>• closure
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (assert_consume(l, state, defined_token_fe70b6f5a727a201(l)/*[--]*/ || defined_token_6d4f77707d3e0e5a(l)/*[++]*/)) {
                        /*consume*/
                        /*
                           12:24 unary=>closure -- •
                           12:25 unary=>closure ++ •
                        */
                        /*--unique-id--12--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 0);
                        debug_stack.push({ name: "unary RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    } else {
                        /*assert-end*/
                        /*
                           12:26 unary=>closure •
                        */
                        /*--unique-id--12--DO-NOT-REPLACE*/
                        debug_stack.push({ name: "unary RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                }
            }
            debug_stack.push({ name: "unary RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: closure
            grammar index: 13
            bodies:
	13:27 closure=>• ( expressions ) - 
		13:28 closure=>• [ expression ] - 
		13:29 closure=>• literal - 
		13:30 closure=>• blocks - 
		13:31 closure=>• fnA - 
		13:32 closure=>• fnB - 
            compile time: 182.702ms*/;
        function $closure(l, state) {
            debug_stack.push({ name: "closure RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, l.utf == 40/*[(]*/)) {
                /*consume*/
                /*
                   13:27 closure=>( • expressions )
                */
                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                if (state = $expressions(l, state)) {
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (assert_consume(l, state, l.utf == 41/*[)]*/)) {
                        /*--unique-id--13--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 0);
                        return $closure_goto(l, state, 13);
                    }
                }
            } else if (l.utf == 91/*[[]*/) {
                /*peek*/
                /*
                   13:28 closure=>• [ expression ]
                   13:30 closure=>• blocks
                */
                let pk = l.copy();
                sk_d65553ab16af0339(pk.next()/*[ ws ][ 23 ][ nl ]*/);
                if (pk.utf == 93/*[]]*/) {
                    /*peek-production-closure*/
                    /*
                       13:30 closure=>• blocks
                    */
                    if (state = $blocks(l, state)) {
                        /*--unique-id--13--DO-NOT-REPLACE*/
                        return $closure_goto(l, state, 13);
                    }
                } else if (((((defined_token_67a732a27c736a2f(pk)/*[++]*/ || defined_token_fe70b6f5a727a201(pk)/*[--]*/) || defined_token_0c3be902c24e826c(pk)/*[0b] [0o] [0O] [0x]*/) || assert_table(pk, 0x0, 0x110, 0x88000000, 0x0)/*tbl:[ _ ] [ $ ] [ ( ] [ [ ]*/) || pk.isID()/*[id]*/) || pk.isNum()/*[num]*/) {
                    /*peek*/
                    /*
                       13:28 closure=>• [ expression ]
                       13:30 closure=>• blocks
                    */
                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                    if (assert_consume(l, state, l.utf == 91/*[[]*/)) {
                        /*consume*/
                        /*
                           13:28 closure=>[ • expression ]
                           1:1 blocks_group_22_100=>[ • expressions ]
                        */
                        sk_d65553ab16af0339(l/*[ ws ][ 23 ][ nl ]*/);
                        if (((((defined_token_67a732a27c736a2f(l)/*[++]*/ || defined_token_fe70b6f5a727a201(l)/*[--]*/) || defined_token_0c3be902c24e826c(l)/*[0b] [0o] [0O] [0x]*/) || assert_table(l, 0x0, 0x110, 0x88000000, 0x0)/*tbl:[ _ ] [ $ ] [ ( ] [ [ ]*/) || l.isID()/*[id]*/) || l.isNum()/*[num]*/) {
                            /*peek*/
                            /*
                               13:28 closure=>[ • expression ]
                               1:1 blocks_group_22_100=>[ • expressions ]
                            */
                            let mk = mark();
                            let anchor = l.copy();
                            let anchor_state = state;
                            /*28:3:1|-,1:3:1|-*/
                            /*13*/
                            if (state = $expression(l, state)) {
                                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                if (assert_consume(l, state, l.utf == 93/*[]]*/)) {
                                    /*--unique-id--13--DO-NOT-REPLACE*/
                                    add_reduce(state, 3, 0);
                                    return $closure_goto(l, state, 13);
                                }
                            }
                            /*28:3:1|-,1:3:1|-*/
                            state = reset(mk, anchor, l, anchor_state);
                            if (state = $expressions(l, state)) {
                                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                if (assert_consume(l, state, l.utf == 93/*[]]*/)) {
                                    /*--unique-id--3--DO-NOT-REPLACE*/
                                    add_reduce(state, 3, 0);
                                    add_reduce(state, 1, 2);
                                    return $closure_goto(l, state, 3);
                                }
                            }
                        }
                    }
                }
            } else if (defined_token_0c3be902c24e826c(l)/*[0b] [0o] [0O] [0x]*/ || l.isNum()/*[num]*/) {
                /*peek-production-closure*/
                /*
                   13:29 closure=>• literal
                */
                if (state = $literal(l, state)) {
                    /*--unique-id--13--DO-NOT-REPLACE*/
                    return $closure_goto(l, state, 13);
                }
            } else {
                /*assert-production-closure*/
                /*
                   55:150 def$js_identifier=>• tk:def$js_id_symbols
                */
                if (state = $def$js_identifier(l, state)) {
                    /*--unique-id--20--DO-NOT-REPLACE*/
                    return $closure_goto(l, state, 20);
                }
            }
            debug_stack.push({ name: "closure RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $closure_goto(l, state, prod) {
            debug_stack.push({ name: "closure GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                switch (prod) {
                    case 3:
                        sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                        if (assert_consume(l, state, l.utf == 38/*[&]*/)) {
                            /*consume*/
                            /*
                               3:5 blocks=>blocks & • blocks_group_22_100
                            */
                            sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (state = $blocks_group_22_100(l, state)) {
                                /*--unique-id--3--DO-NOT-REPLACE*/
                                add_reduce(state, 3, 1);
                                prod = 3;
                                continue;
                            }
                        } else {
                            /*assert-end*/
                            /*
                               13:30 closure=>blocks •
                            */
                            /*--unique-id--13--DO-NOT-REPLACE*/
                            prod = 13;
                            continue;
                        }
                        break;
                    case 20:
                        sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                        if (defined_token_b2fe121993c428ee(l)/*[=>]*/) {
                            /*peek*/
                            /*
                               14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                               16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                            */
                            let pk = l.copy();
                            sk_72712f05fd3b2441(pk.next()/*[ ws ][ num ][ 23 ][ nl ]*/);
                            if (def$js_id_symbols_tok_b3199095c9facd2b(pk) || pk.END()) {
                                /*peek-production-closure*/
                                /*
                                   16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                                */
                                if (state = $fnB_group_026_104(l, state)) {
                                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $def$js_identifier(l, state)) {
                                        sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (state = $reserved_word(l, state)) {
                                            sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (assert_consume(l, state, false)) {
                                                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                                if (state = $blocks(l, state)) {
                                                    /*--unique-id--13--DO-NOT-REPLACE*/
                                                    add_reduce(state, 6, 0);
                                                    prod = 13;
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (((pk.utf == 95/*[_]*/) || (pk.utf == 36/*[$]*/)) || pk.isID()/*[id]*/) {
                                /*peek*/
                                /*
                                   14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                                */
                                if (assert_consume(l, state, defined_token_b2fe121993c428ee(l)/*[=>]*/)) {
                                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $def$js_identifier(l, state)) {
                                        sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (state = $reserved_word(l, state)) {
                                            sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (assert_consume(l, state, false)) {
                                                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                                if (state = $blocks(l, state)) {
                                                    /*--unique-id--13--DO-NOT-REPLACE*/
                                                    add_reduce(state, 6, 0);
                                                    prod = 13;
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (defined_token_498c462f670f746c(l)/*[>=]*/) {
                            /*peek-production-closure*/
                            /*
                               16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks
                            */
                            if (state = $fnB_group_026_104(l, state)) {
                                sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                if (state = $def$js_identifier(l, state)) {
                                    sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                    if (state = $reserved_word(l, state)) {
                                        sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                        if (assert_consume(l, state, false)) {
                                            sk_72712f05fd3b2441(l/*[ ws ][ num ][ 23 ][ nl ]*/);
                                            if (state = $blocks(l, state)) {
                                                /*--unique-id--13--DO-NOT-REPLACE*/
                                                add_reduce(state, 6, 0);
                                                prod = 13;
                                                continue;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            /*assert-end*/
                            /*
                               17:37 literal=>identifier •
                            */
                            /*--unique-id--13--DO-NOT-REPLACE*/
                            prod = 13;
                            continue;
                        }
                        break;
                }
                break;
            }
            debug_stack.push({ name: "closure GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 13);
        }
/*production name: fnB_group_026_104
            grammar index: 15
            bodies:
	15:34 fnB_group_026_104=>• => - 
		15:35 fnB_group_026_104=>• >= - 
            compile time: 0.826ms*/;
        function $fnB_group_026_104(l, state) {
            debug_stack.push({ name: "fnB_group_026_104 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_b2fe121993c428ee(l)/*[=>]*/ || defined_token_498c462f670f746c(l)/*[>=]*/)) {
                /*consume*/
                /*
                   15:34 fnB_group_026_104=>=> •
                   15:35 fnB_group_026_104=>>= •
                */
                /*--unique-id--15--DO-NOT-REPLACE*/
                debug_stack.push({ name: "fnB_group_026_104 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "fnB_group_026_104 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: literal
            grammar index: 17
            bodies:
	17:37 literal=>• identifier - 
		17:38 literal=>• def$number - 
		17:39 literal=>• def$binary - 
		17:40 literal=>• def$octal - 
		17:41 literal=>• def$hex - 
            compile time: 2.827ms*/;
        function $literal(l, state) {
            debug_stack.push({ name: "literal RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (defined_token_33b1e9553bafe159(l)/*[0b]*/) {
                /*peek-production-closure*/
                /*
                   17:39 literal=>• def$binary
                */
                if (state = $def$binary(l, state)) {
                    /*--unique-id--17--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "literal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            } else if (defined_token_60c8247a60511d72(l)/*[0x]*/) {
                /*peek-production-closure*/
                /*
                   17:41 literal=>• def$hex
                */
                if (state = $def$hex(l, state)) {
                    /*--unique-id--17--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "literal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            } else if (defined_token_ad665389bc23e01f(l)/*[0o] [0O]*/) {
                /*peek-production-closure*/
                /*
                   17:40 literal=>• def$octal
                */
                if (state = $def$octal(l, state)) {
                    /*--unique-id--17--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "literal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            } else if (l.isNum()/*[num]*/) {
                /*peek-production-closure*/
                /*
                   17:38 literal=>• def$number
                */
                if (state = $def$number(l, state)) {
                    /*--unique-id--17--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "literal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            } else {
                /*peek-production-closure*/
                /*
                   17:37 literal=>• identifier
                */
                if (state = $def$js_identifier(l, state)) {
                    /*--unique-id--17--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "literal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "literal RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: reserved_word
            grammar index: 18
            bodies:
	18:42 reserved_word=>• if - 
		18:43 reserved_word=>• then - 
		18:44 reserved_word=>• else - 
		18:45 reserved_word=>• maybe - 
		18:46 reserved_word=>• private - 
		18:47 reserved_word=>• or - 
            compile time: 3.188ms*/;
        function $reserved_word(l, state) {
            debug_stack.push({ name: "reserved_word RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, ((((defined_token_911b730840de3b6c(l)/*[if]*/ || defined_token_6e58d2029f2d4e4a(l)/*[then]*/) || defined_token_7c714fc2ee65a23e(l)/*[else]*/) || defined_token_66606a6e3bc4e858(l)/*[maybe]*/) || defined_token_ff317a5334168f4a(l)/*[private]*/) || defined_token_a7d1889f903e4d81(l)/*[or]*/)) {
                /*consume*/
                /*
                   18:42 reserved_word=>if •
                   18:43 reserved_word=>then •
                   18:44 reserved_word=>else •
                   18:45 reserved_word=>maybe •
                   18:46 reserved_word=>private •
                   18:47 reserved_word=>or •
                */
                /*--unique-id--18--DO-NOT-REPLACE*/
                debug_stack.push({ name: "reserved_word RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "reserved_word RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: comment_group_045_106
            grammar index: 21
            bodies:
	21:50 comment_group_045_106=>• θnum - 
		21:51 comment_group_045_106=>• θid - 
		21:52 comment_group_045_106=>• θsym - 
		21:53 comment_group_045_106=>• θws - 
		21:54 comment_group_045_106=>• θnl - 
            compile time: 2.202ms*/;
        function $comment_group_045_106(l, state) {
            debug_stack.push({ name: "comment_group_045_106 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, (((l.isID()/*[id]*/ || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/) || l.isSym()/*[sym]*/) || l.isSP()/*[ws]*/)) {
                /*consume*/
                /*
                   21:50 comment_group_045_106=>θnum •
                   21:51 comment_group_045_106=>θid •
                   21:52 comment_group_045_106=>θsym •
                   21:53 comment_group_045_106=>θws •
                   21:54 comment_group_045_106=>θnl •
                */
                /*--unique-id--21--DO-NOT-REPLACE*/
                debug_stack.push({ name: "comment_group_045_106 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "comment_group_045_106 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: comment_HC_listbody1_107
            grammar index: 22
            bodies:
	22:55 comment_HC_listbody1_107=>• comment_HC_listbody1_107 comment_group_045_106 - 
		22:56 comment_HC_listbody1_107=>• comment_group_045_106 - 
            compile time: 3.08ms*/;
        function $comment_HC_listbody1_107(l, state) {
            debug_stack.push({ name: "comment_HC_listbody1_107 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $comment_group_045_106(l, state)) {
                /*--unique-id--22--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $comment_HC_listbody1_107_goto(l, state, 22);
            }
            debug_stack.push({ name: "comment_HC_listbody1_107 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $comment_HC_listbody1_107_goto(l, state, prod) {
            debug_stack.push({ name: "comment_HC_listbody1_107 GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                if (defined_token_0ca2cff5a3c99027(l)/*[asterisk/]*/) {
                    return state;
                }
                if ((((l.isID()/*[id]*/ || l.isNL()/*[nl]*/) || l.isNum()/*[num]*/) || l.isSym()/*[sym]*/) || l.isSP()/*[ws]*/) {
                    /*peek-production-closure*/
                    /*
                       22:55 comment_HC_listbody1_107=>comment_HC_listbody1_107 • comment_group_045_106
                    */
                    if (state = $comment_group_045_106(l, state)) {
                        /*--unique-id--22--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 3);
                        prod = 22;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "comment_HC_listbody1_107 GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 22);
        }
/*production name: comment
            grammar index: 23
            bodies:
	23:57 comment=>• /* comment_HC_listbody1_107 * / - 
		23:58 comment=>• /* * / - 
            compile time: 1.876ms*/;
        function $comment(l, state) {
            debug_stack.push({ name: "comment RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_88fe0e82e8d7b114(l)/*[/asterisk]*/)) {
                /*consume*/
                /*
                   23:57 comment=>/* • comment_HC_listbody1_107 * /
                   23:58 comment=>/* • * /
                */
                if (assert_consume(l, state, defined_token_0ca2cff5a3c99027(l)/*[asterisk/]*/)) {
                    /*consume*/
                    /*
                       23:58 comment=>/* * / •
                    */
                    /*--unique-id--23--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "comment RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                } else {
                    /*peek-production-closure*/
                    /*
                       23:57 comment=>/* • comment_HC_listbody1_107 * /
                    */
                    if (state = $comment_HC_listbody1_107(l, state)) {
                        sk_fc3fdb866be49cf6(l/*[ ws ][ num ][ nl ]*/);
                        if (assert_consume(l, state, defined_token_c1fd3ef6c0b69274(l)/*[asterisk/]*/)) {
                            /*--unique-id--23--DO-NOT-REPLACE*/
                            add_reduce(state, 3, 0);
                            debug_stack.push({ name: "comment RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                            return state;
                        }
                    }
                }
            }
            debug_stack.push({ name: "comment RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$hex
            grammar index: 29
            bodies:
	29:83 def$hex=>• tk:def$hex_token - 
            compile time: 0.527ms*/;
        function $def$hex(l, state) {
            debug_stack.push({ name: "def$hex RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, def$hex_token_tok_1118cc1504233a17(l))) {
                /*consume*/
                /*
                   29:83 def$hex=>tk:def$hex_token •
                */
                /*--unique-id--29--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$hex RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$hex RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$binary
            grammar index: 30
            bodies:
	30:84 def$binary=>• tk:def$binary_token - 
            compile time: 0.895ms*/;
        function $def$binary(l, state) {
            debug_stack.push({ name: "def$binary RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, def$binary_token_tok_0dd6a5d8776a65dc(l))) {
                /*consume*/
                /*
                   30:84 def$binary=>tk:def$binary_token •
                */
                /*--unique-id--30--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$binary RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$binary RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$octal
            grammar index: 31
            bodies:
	31:85 def$octal=>• tk:def$octal_token - 
            compile time: 1.004ms*/;
        function $def$octal(l, state) {
            debug_stack.push({ name: "def$octal RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, def$octal_token_tok_d4c33e0f61b14fb0(l))) {
                /*consume*/
                /*
                   31:85 def$octal=>tk:def$octal_token •
                */
                /*--unique-id--31--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$octal RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$octal RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$number
            grammar index: 32
            bodies:
	32:86 def$number=>• tk:def$scientific_token - 
            compile time: 0.847ms*/;
        function $def$number(l, state) {
            debug_stack.push({ name: "def$number RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, def$scientific_token_tok_55f659f8323305af(l))) {
                /*consume*/
                /*
                   32:86 def$number=>tk:def$scientific_token •
                */
                /*--unique-id--32--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$number RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$number RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$scientific_token_group_027_101
            grammar index: 33
            bodies:
	33:87 def$scientific_token_group_027_101=>• e - 
		33:88 def$scientific_token_group_027_101=>• E - 
            compile time: 0.787ms*/;
        function $def$scientific_token_group_027_101(l, state) {
            debug_stack.push({ name: "def$scientific_token_group_027_101 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, (l.utf == 101/*[e]*/) || (l.utf == 69/*[E]*/))) {
                /*consume*/
                /*
                   33:87 def$scientific_token_group_027_101=>e •
                   33:88 def$scientific_token_group_027_101=>E •
                */
                /*--unique-id--33--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$scientific_token_group_027_101 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$scientific_token_group_027_101 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$scientific_token_group_228_102
            grammar index: 34
            bodies:
	34:89 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		34:90 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 3.349ms*/;
        function $def$scientific_token_group_228_102(l, state) {
            debug_stack.push({ name: "def$scientific_token_group_228_102 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$scientific_token_group_027_101(l, state)) {
                /*assert*/
                /*
                   34:89 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum
                   34:90 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum
                */
                sk_d65553ab16af0339(l/*[ ws ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.utf == 45/*[-]*/)) {
                    /*consume*/
                    /*
                       34:89 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 - • θnum
                    */
                    sk_d65553ab16af0339(l/*[ ws ][ 23 ][ nl ]*/);
                    if (assert_consume(l, state, l.isNum()/*[num]*/)) {
                        /*--unique-id--34--DO-NOT-REPLACE*/
                        add_reduce(state, 3, 0);
                        debug_stack.push({ name: "def$scientific_token_group_228_102 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                } else if (assert_consume(l, state, l.isNum()/*[num]*/)) {
                    /*consume*/
                    /*
                       34:90 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 θnum •
                    */
                    /*--unique-id--34--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "def$scientific_token_group_228_102 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$scientific_token_group_228_102 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$scientific_token
            grammar index: 35
            bodies:
	35:91 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		35:92 def$scientific_token=>• def$float_token - 
            compile time: 2.709ms*/;
        function $def$scientific_token(l, state) {
            debug_stack.push({ name: "def$scientific_token RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$float_token(l, state)) {
                /*assert*/
                /*
                   35:91 def$scientific_token=>• def$float_token def$scientific_token_group_228_102
                   35:92 def$scientific_token=>• def$float_token
                */
                sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                if ((l.utf == 101/*[e]*/) || (l.utf == 69/*[E]*/)) {
                    /*assert-production-closure*/
                    /*
                       35:91 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
                    */
                    if (state = $def$scientific_token_group_228_102(l, state)) {
                        /*--unique-id--35--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 0);
                        debug_stack.push({ name: "def$scientific_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*
                       35:92 def$scientific_token=>def$float_token •
                    */
                    /*--unique-id--35--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "def$scientific_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$scientific_token RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$float_token_group_130_103
            grammar index: 36
            bodies:
	36:93 def$float_token_group_130_103=>• . θnum - 
            compile time: 1.317ms*/;
        function $def$float_token_group_130_103(l, state) {
            debug_stack.push({ name: "def$float_token_group_130_103 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, l.utf == 46/*[.]*/)) {
                /*consume*/
                /*
                   36:93 def$float_token_group_130_103=>. • θnum
                */
                sk_d65553ab16af0339(l/*[ ws ][ 23 ][ nl ]*/);
                if (assert_consume(l, state, l.isNum()/*[num]*/)) {
                    /*--unique-id--36--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "def$float_token_group_130_103 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$float_token_group_130_103 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$float_token
            grammar index: 37
            bodies:
	37:94 def$float_token=>• θnum def$float_token_group_130_103 - 
		37:95 def$float_token=>• θnum - 
            compile time: 2.223ms*/;
        function $def$float_token(l, state) {
            debug_stack.push({ name: "def$float_token RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, l.isNum()/*[num]*/)) {
                /*consume*/
                /*
                   37:94 def$float_token=>θnum • def$float_token_group_130_103
                   37:95 def$float_token=>θnum •
                */
                sk_8ab5cd505e6df373(l/*[ num ][ 23 ]*/);
                if (l.utf == 46/*[.]*/) {
                    /*assert-production-closure*/
                    /*
                       37:94 def$float_token=>θnum • def$float_token_group_130_103
                    */
                    if (state = $def$float_token_group_130_103(l, state)) {
                        /*--unique-id--37--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 0);
                        debug_stack.push({ name: "def$float_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                        return state;
                    }
                } else {
                    /*assert-end*/
                    /*
                       37:95 def$float_token=>θnum •
                    */
                    /*--unique-id--37--DO-NOT-REPLACE*/
                    debug_stack.push({ name: "def$float_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$float_token RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$hex_token_group_044_104
            grammar index: 38
            bodies:
	38:96 def$hex_token_group_044_104=>• θnum - 
		38:97 def$hex_token_group_044_104=>• a - 
		38:98 def$hex_token_group_044_104=>• b - 
		38:99 def$hex_token_group_044_104=>• c - 
		38:100 def$hex_token_group_044_104=>• d - 
		38:101 def$hex_token_group_044_104=>• e - 
		38:102 def$hex_token_group_044_104=>• f - 
		38:103 def$hex_token_group_044_104=>• A - 
		38:104 def$hex_token_group_044_104=>• B - 
		38:105 def$hex_token_group_044_104=>• C - 
		38:106 def$hex_token_group_044_104=>• D - 
		38:107 def$hex_token_group_044_104=>• E - 
		38:108 def$hex_token_group_044_104=>• F - 
            compile time: 2.703ms*/;
        function $def$hex_token_group_044_104(l, state) {
            debug_stack.push({ name: "def$hex_token_group_044_104 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, assert_table(l, 0x0, 0x0, 0x7e, 0x7e)/*tbl:[ a ] [ b ] [ c ] [ d ] [ e ] [ f ] [ A ] [ B ] [ C ] [ D ] [ E ] [ F ]*/ || l.isNum()/*[num]*/)) {
                /*consume*/
                /*
                   38:96 def$hex_token_group_044_104=>θnum •
                   38:97 def$hex_token_group_044_104=>a •
                   38:98 def$hex_token_group_044_104=>b •
                   38:99 def$hex_token_group_044_104=>c •
                   38:100 def$hex_token_group_044_104=>d •
                   38:101 def$hex_token_group_044_104=>e •
                   38:102 def$hex_token_group_044_104=>f •
                   38:103 def$hex_token_group_044_104=>A •
                   38:104 def$hex_token_group_044_104=>B •
                   38:105 def$hex_token_group_044_104=>C •
                   38:106 def$hex_token_group_044_104=>D •
                   38:107 def$hex_token_group_044_104=>E •
                   38:108 def$hex_token_group_044_104=>F •
                */
                /*--unique-id--38--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$hex_token_group_044_104 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$hex_token_group_044_104 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 39
            bodies:
	39:109 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		39:110 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 4.06ms*/;
        function $def$hex_token_HC_listbody1_105(l, state) {
            debug_stack.push({ name: "def$hex_token_HC_listbody1_105 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$hex_token_group_044_104(l, state)) {
                /*--unique-id--39--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $def$hex_token_HC_listbody1_105_goto(l, state, 39);
            }
            debug_stack.push({ name: "def$hex_token_HC_listbody1_105 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $def$hex_token_HC_listbody1_105_goto(l, state, prod) {
            debug_stack.push({ name: "def$hex_token_HC_listbody1_105 GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_8c59dafe191078c6(l/*[ 23 ][ nl ]*/);
                if (l.isSP()/*[ws]*/) {
                    return state;
                }
                if (assert_table(l, 0x0, 0x0, 0x7e, 0x7e)/*tbl:[ a ] [ b ] [ c ] [ d ] [ e ] [ f ] [ A ] [ B ] [ C ] [ D ] [ E ] [ F ]*/ || l.isNum()/*[num]*/) {
                    /*assert-production-closure*/
                    /*
                       39:109 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
                    */
                    if (state = $def$hex_token_group_044_104(l, state)) {
                        /*--unique-id--39--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 3);
                        prod = 39;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "def$hex_token_HC_listbody1_105 GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 39);
        }
/*production name: def$hex_token
            grammar index: 40
            bodies:
	40:111 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 1.1ms*/;
        function $def$hex_token(l, state) {
            debug_stack.push({ name: "def$hex_token RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_60c8247a60511d72(l)/*[0x]*/)) {
                /*consume*/
                /*
                   40:111 def$hex_token=>0x • def$hex_token_HC_listbody1_105
                */
                sk_8c59dafe191078c6(l/*[ 23 ][ nl ]*/);
                if (state = $def$hex_token_HC_listbody1_105(l, state)) {
                    /*--unique-id--40--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "def$hex_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$hex_token RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$binary_token_group_047_106
            grammar index: 41
            bodies:
	41:112 def$binary_token_group_047_106=>• 0 - 
		41:113 def$binary_token_group_047_106=>• 1 - 
            compile time: 0.814ms*/;
        function $def$binary_token_group_047_106(l, state) {
            debug_stack.push({ name: "def$binary_token_group_047_106 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, (l.utf == 48/*[0]*/) || (l.utf == 49/*[1]*/))) {
                /*consume*/
                /*
                   41:112 def$binary_token_group_047_106=>0 •
                   41:113 def$binary_token_group_047_106=>1 •
                */
                /*--unique-id--41--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$binary_token_group_047_106 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$binary_token_group_047_106 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 42
            bodies:
	42:114 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		42:115 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 2.741ms*/;
        function $def$binary_token_HC_listbody1_107(l, state) {
            debug_stack.push({ name: "def$binary_token_HC_listbody1_107 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$binary_token_group_047_106(l, state)) {
                /*--unique-id--42--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $def$binary_token_HC_listbody1_107_goto(l, state, 42);
            }
            debug_stack.push({ name: "def$binary_token_HC_listbody1_107 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $def$binary_token_HC_listbody1_107_goto(l, state, prod) {
            debug_stack.push({ name: "def$binary_token_HC_listbody1_107 GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                if (l.isSP()/*[ws]*/) {
                    return state;
                }
                if ((l.utf == 48/*[0]*/) || (l.utf == 49/*[1]*/)) {
                    /*assert-production-closure*/
                    /*
                       42:114 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
                    */
                    if (state = $def$binary_token_group_047_106(l, state)) {
                        /*--unique-id--42--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 3);
                        prod = 42;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "def$binary_token_HC_listbody1_107 GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 42);
        }
/*production name: def$binary_token
            grammar index: 43
            bodies:
	43:116 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 2.79ms*/;
        function $def$binary_token(l, state) {
            debug_stack.push({ name: "def$binary_token RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_33b1e9553bafe159(l)/*[0b]*/)) {
                /*consume*/
                /*
                   43:116 def$binary_token=>0b • def$binary_token_HC_listbody1_107
                */
                sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                if (state = $def$binary_token_HC_listbody1_107(l, state)) {
                    /*--unique-id--43--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "def$binary_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$binary_token RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$octal_token_group_050_108
            grammar index: 44
            bodies:
	44:117 def$octal_token_group_050_108=>• 0o - 
		44:118 def$octal_token_group_050_108=>• 0O - 
            compile time: 1.322ms*/;
        function $def$octal_token_group_050_108(l, state) {
            debug_stack.push({ name: "def$octal_token_group_050_108 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, defined_token_ad665389bc23e01f(l)/*[0o] [0O]*/)) {
                /*consume*/
                /*
                   44:117 def$octal_token_group_050_108=>0o •
                   44:118 def$octal_token_group_050_108=>0O •
                */
                /*--unique-id--44--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$octal_token_group_050_108 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$octal_token_group_050_108 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$octal_token_group_058_109
            grammar index: 45
            bodies:
	45:119 def$octal_token_group_058_109=>• 0 - 
		45:120 def$octal_token_group_058_109=>• 1 - 
		45:121 def$octal_token_group_058_109=>• 2 - 
		45:122 def$octal_token_group_058_109=>• 3 - 
		45:123 def$octal_token_group_058_109=>• 4 - 
		45:124 def$octal_token_group_058_109=>• 5 - 
		45:125 def$octal_token_group_058_109=>• 6 - 
		45:126 def$octal_token_group_058_109=>• 7 - 
            compile time: 1.944ms*/;
        function $def$octal_token_group_058_109(l, state) {
            debug_stack.push({ name: "def$octal_token_group_058_109 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, assert_table(l, 0x0, 0xff0000, 0x0, 0x0)/*tbl:[ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]*/)) {
                /*consume*/
                /*
                   45:119 def$octal_token_group_058_109=>0 •
                   45:120 def$octal_token_group_058_109=>1 •
                   45:121 def$octal_token_group_058_109=>2 •
                   45:122 def$octal_token_group_058_109=>3 •
                   45:123 def$octal_token_group_058_109=>4 •
                   45:124 def$octal_token_group_058_109=>5 •
                   45:125 def$octal_token_group_058_109=>6 •
                   45:126 def$octal_token_group_058_109=>7 •
                */
                /*--unique-id--45--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$octal_token_group_058_109 RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$octal_token_group_058_109 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 46
            bodies:
	46:127 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		46:128 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 2.152ms*/;
        function $def$octal_token_HC_listbody1_110(l, state) {
            debug_stack.push({ name: "def$octal_token_HC_listbody1_110 RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$octal_token_group_058_109(l, state)) {
                /*--unique-id--46--DO-NOT-REPLACE*/
                add_reduce(state, 1, 2);
                return $def$octal_token_HC_listbody1_110_goto(l, state, 46);
            }
            debug_stack.push({ name: "def$octal_token_HC_listbody1_110 RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $def$octal_token_HC_listbody1_110_goto(l, state, prod) {
            debug_stack.push({ name: "def$octal_token_HC_listbody1_110 GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                if (l.isSP()/*[ws]*/) {
                    return state;
                }
                if (assert_table(l, 0x0, 0xff0000, 0x0, 0x0)/*tbl:[ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]*/) {
                    /*assert-production-closure*/
                    /*
                       46:127 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
                    */
                    if (state = $def$octal_token_group_058_109(l, state)) {
                        /*--unique-id--46--DO-NOT-REPLACE*/
                        add_reduce(state, 2, 3);
                        prod = 46;
                        continue;
                    }
                }
                break;
            }
            debug_stack.push({ name: "def$octal_token_HC_listbody1_110 GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 46);
        }
/*production name: def$octal_token
            grammar index: 47
            bodies:
	47:129 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 1.002ms*/;
        function $def$octal_token(l, state) {
            debug_stack.push({ name: "def$octal_token RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (state = $def$octal_token_group_050_108(l, state)) {
                sk_31d5c6f155126dd5(l/*[ num ][ 23 ][ nl ]*/);
                if (state = $def$octal_token_HC_listbody1_110(l, state)) {
                    /*--unique-id--47--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 0);
                    debug_stack.push({ name: "def$octal_token RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                    return state;
                }
            }
            debug_stack.push({ name: "def$octal_token RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$js_identifier
            grammar index: 55
            bodies:
	55:150 def$js_identifier=>• tk:def$js_id_symbols - 
            compile time: 5.518ms*/;
        function $def$js_identifier(l, state) {
            debug_stack.push({ name: "def$js_identifier RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, def$js_id_symbols_tok_b3199095c9facd2b(l))) {
                /*consume*/
                /*
                   55:150 def$js_identifier=>tk:def$js_id_symbols •
                */
                /*--unique-id--55--DO-NOT-REPLACE*/
                debug_stack.push({ name: "def$js_identifier RD return", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
                return state;
            }
            debug_stack.push({ name: "def$js_identifier RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
/*production name: def$js_id_symbols
            grammar index: 56
            bodies:
	56:151 def$js_id_symbols=>• def$js_id_symbols θid - 
		56:152 def$js_id_symbols=>• def$js_id_symbols _ - 
		56:153 def$js_id_symbols=>• def$js_id_symbols $ - 
		56:154 def$js_id_symbols=>• def$js_id_symbols θnum - 
		56:155 def$js_id_symbols=>• _ - 
		56:156 def$js_id_symbols=>• $ - 
		56:157 def$js_id_symbols=>• θid - 
            compile time: 5.044ms*/;
        function $def$js_id_symbols(l, state) {
            debug_stack.push({ name: "def$js_id_symbols RD START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            if (assert_consume(l, state, ((l.utf == 95/*[_]*/) || (l.utf == 36/*[$]*/)) || l.isID()/*[id]*/)) {
                /*consume*/
                /*
                   56:155 def$js_id_symbols=>_ •
                   56:156 def$js_id_symbols=>$ •
                   56:157 def$js_id_symbols=>θid •
                */
                /*--unique-id--56--DO-NOT-REPLACE*/
                return $def$js_id_symbols_goto(l, state, 56);
            }
            debug_stack.push({ name: "def$js_id_symbols RD FAILED", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return 0;
        }
        function $def$js_id_symbols_goto(l, state, prod) {
            debug_stack.push({ name: "def$js_id_symbols GOTO START", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            while (1) {
                sk_8c59dafe191078c6(l/*[ 23 ][ nl ]*/);
                if (l.isSP()/*[ws]*/) {
                    return state;
                }
                if (assert_consume(l, state, (((l.utf == 95/*[_]*/) || (l.utf == 36/*[$]*/)) || l.isID()/*[id]*/) || l.isNum()/*[num]*/)) {
                    /*consume*/
                    /*
                       56:151 def$js_id_symbols=>def$js_id_symbols θid •
                       56:152 def$js_id_symbols=>def$js_id_symbols _ •
                       56:153 def$js_id_symbols=>def$js_id_symbols $ •
                       56:154 def$js_id_symbols=>def$js_id_symbols θnum •
                    */
                    /*--unique-id--56--DO-NOT-REPLACE*/
                    add_reduce(state, 2, 5);
                    prod = 56;
                    continue;
                }
                break;
            }
            debug_stack.push({ name: "def$js_id_symbols GOTO END", state, tx: str.slice(l.off, l.off + l.tl), ty: l.ty, tl: l.tl, utf: l.getUTF(), FAILED: state == 0, offset: l.off });
            return assertSuccess(l, state, prod == 56);
        }
        function main(input_string) {
            str = input_string;
            const l = new Lexer();
            l.next();
            reset_counters_and_pointers();
            sk_ea0b808ad54b3f8b(l/*[ ws ][ num ][ 23 ][ nl ]*/);
            let state = $start(l, createState(1));
            set_action(0);
            set_error(0);
            return hasStateFailed(state) || !l.END();
        }
        return main;
    })(shared_memory, debug_stack);

const fns = [(e, sym) => sym[sym.length - 1],
(env, sym, pos) => (([...sym[0], sym[2]]))/*0*/
    , (env, sym, pos) => ([sym[0]])/*1*/
    , (env, sym, pos) => (([...sym[0], sym[1]]))/*2*/
    , (env, sym, pos) => (sym[1])/*3*/
    , (env, sym, pos) => (sym[0] + sym[1])/*4*/
    , (env, sym, pos) => (sym[0] + "")/*5*/];

export default function (str, env = {}) {

    debug_stack.length = 0;
    const
        FAILED = recognizer(str), // call with pointers
        stack = [];

    let action_length = 0,
        error_message = "",
        review_stack = [];


    if (FAILED) {

        for (let i = debug_stack.length - 1, j = 0; i >= 0; i--) {
            if (!debug_stack[i].FAILED && j++ > 80)
                break;
            review_stack.push(debug_stack[i]);
        }

        review_stack.reverse();

        if (review_stack.length > 0)
            console.log({ review_stack });

        let error_off = 10000000000000;
        let error_set = false;


        const lexer = new Lexer(str);

        for (let i = 0; i < error_array.length; i++) {
            if (error_array[i] > 0) {
                if (!error_set) {
                    error_set = true;
                    error_off = 0;
                }
                error_off = Math.max(error_off, error_array[i]);
            }
        }

        if (error_off == 10000000000000)
            error_off = 0;

        while (lexer.off < error_off && !lexer.END) lexer.next();

        error_message = lexer.errorMessage(`Unexpected token[${lexer.tx}]`);


    } else {

        let offset = 0, pos = [];

        for (const action of action_array) {

            action_length++;

            if (action == 0) break;

            switch (action & 1) {
                case 0: //REDUCE;
                    {
                        const
                            DO_NOT_PUSH_TO_STACK = (action >> 1) & 1,
                            body = action >> 16,
                            len = ((action >> 2) & 0x3FFF);

                        const pos_a = pos[pos.length - len] || { off: 0, tl: 0 };
                        const pos_b = pos[pos.length - 1] || { off: 0, tl: 0 };
                        pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl };

                        stack[stack.length - len] = fns[body](env, stack.slice(-len), { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl });

                        if (!DO_NOT_PUSH_TO_STACK) {
                            stack.length = stack.length - len + 1;
                            pos.length = pos.length - len + 1;
                        } else {
                            stack.length = stack.length - len;
                            pos.length = pos.length - len;
                        }

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
                    } else {
                        stack.push("");
                        pos.push({ off: offset, tl: 0 });
                    }
                } break;
            }
        }
    }

    return { result: stack, FAILED: !!FAILED, action_length, error_message, review_stack };
}