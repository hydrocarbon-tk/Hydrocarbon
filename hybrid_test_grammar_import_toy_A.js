export default (b) => {
    const pos = null;

    function lm(lex, syms) {
        for (const sym of syms)
            switch (typeof sym) {
                case "number":
                    if (sym == 0xFF && lex.END) return true;
                    if (lex.ty == sym) return true;
                    break;
                case "string":
                    if (lex.tx == sym) return true;
                    break;
            }
        return false;
    }

    function fail(lex, e) {


        if (e.FAILED) console.log("_______________________________");
        e.FAILED = true;
        e.error.push(lex.copy());
    }

    function _s(s, lex, e, eh, skips, ...syms) {

        if (e.FAILED) return "";

        var val = lex.tx;

        if (syms.length == 0 || lm(lex, syms)) {

            lex.next();

            if (skips) while (lm(lex, skips)) lex.next();

            e.sp++;

            s.push(val);

        } else {

            //error recovery
            const tx = eh(lex, e);


            if (!tx) {
                if (e.FAILED) console.log("_______________________________a");
                e.FAILED = true;
                e.error.push(lex.copy());
            }
        }

        return s;
    }


    function _(lex, e, eh, skips, ...syms) {

        if (e.FAILED) return "";

        var val = lex.tx;

        if (e.FAILED) console.log("_______________________________a");

        if (syms.length == 0 || lm(lex, syms)) {

            lex.next();

            if (skips) while (lm(lex, skips)) lex.next();

            return val;
        } else {

            //error recovery
            const tx = eh(lex, e);

            if (tx) return tx;

            else {
                if (e.FAILED) console.log("_______________________________b");
                e.FAILED = true;
                e.error.push(lex.copy());
            }
        }
    }


    function $S(l, e) {

        if (e.FAILED) return;
        const $1_ = $B(l, e);
        e.p = (e.FAILED) ? -1 : 0;

        return $1_;
        e.FAILED = true;
    }
    function $B(l, e) {
        const tx = l.tx;
        if (tx == "<") {

            _(l, e, e.eh, [8, 256], "<");

            if (e.FAILED) return;
            const $2_ = $expression(l, e);

            _(l, e, e.eh, [8, 256], ">");
            e.p = (e.FAILED) ? -1 : 1;

            return ({ type: "BRACKET", val: $2_ });
        }
        if (tx == "for") {

            if (e.FAILED) return;
            const $1_ = $for_stmt(l, e);
            e.p = (e.FAILED) ? -1 : 1;

            return $1_;
        }
        e.FAILED = true;
    }
    function $for_stmt(l, e) {

        _(l, e, e.eh, [8, 256], "for");

        _(l, e, e.eh, [8, 256], "(");

        if (e.FAILED) return;
        const $3_ = $const(l, e);

        if (e.FAILED) return;
        const $4_ = $expression(l, e);

        _(l, e, e.eh, [8, 256], ";");

        if (e.FAILED) return;
        const $6_ = $expression(l, e);

        _(l, e, e.eh, [8, 256], ")");

        if (e.FAILED) return;
        const $8_ = $expression(l, e);

        _(l, e, e.eh, [8, 256], ";");
        e.p = (e.FAILED) ? -1 : 2;

        return ({

            type: "FOR_CONST",

            init: $3_,

            bool: $4_,

            post: $6_,

            body: $8_
        });
        e.FAILED = true;
    }
    function $const(l, e) {

        _(l, e, e.eh, [8, 256], "const");

        if (e.FAILED) return;
        const $2_ = $expression(l, e);

        _(l, e, e.eh, [8, 256], ";");
        e.p = (e.FAILED) ? -1 : 3;

        return ({ type: "CONST", val: $2_ });
        e.FAILED = true;
    }
    "LR USE FOR expression_list_HC_listbody3_100,expression_list_HC_listbody3_100";
    "LR USE FOR expression_list,expression_list";
    "LR USE FOR expression,expression";
    function $add(l, e) {

        if (e.FAILED) return;
        const $1_ = $mult(l, e);
        const tx = l.tx;
        if (tx == "+") {

            _(l, e, e.eh, [8, 256], "+");

            if (e.FAILED) return;
            const $3_ = $add(l, e);
            e.p = (e.FAILED) ? -1 : 7;

            return ({ type: "ADD", l: $1_, r: $3_ });
        }
        e.p = (e.FAILED) ? -1 : 7;

        return $1_;
        e.FAILED = true;
    }
    function $mult(l, e) {

        if (e.FAILED) return;
        const $1_ = $sym(l, e);
        const tx = l.tx;
        if (tx == "*") {

            _(l, e, e.eh, [8, 256], "*");

            if (e.FAILED) return;
            const $3_ = $mult(l, e);
            e.p = (e.FAILED) ? -1 : 8;

            return ({ type: "MUL", l: $1_, r: $3_ });
        }
        e.p = (e.FAILED) ? -1 : 8;

        return $1_;
        e.FAILED = true;
    }
    function $sym(l, e) {

        if (e.FAILED) return;
        const $1_ = $id(l, e);
        e.p = (e.FAILED) ? -1 : 9;

        return $1_;
        e.FAILED = true;
    }
    function $id(l, e) {

        const $1_ = _(l, e, e.eh, [8, 256], 2);
        e.p = (e.FAILED) ? -1 : 10;

        return $1_;
        e.FAILED = true;
    }
    function $num(l, e) {

        const $1_ = _(l, e, e.eh, [8, 256], 1);
        e.p = (e.FAILED) ? -1 : 11;

        return $1_;
        e.FAILED = true;
    }
    function $expression(l, e, s = []) {
        const sp = e.sp;
        e.p = -1;
        switch (l.tx) {
            case "*":
                s = State7(l, e, _s(s, l, e, e.eh, [8, 256]));
                break;
            case "+":
                s = State14(l, e, _s(s, l, e, e.eh, [8, 256]));
            default:
                switch (l.ty) {
                    case 2:
                        s = State6(l, e, _s(s, l, e, e.eh, [8, 256]));
                        break;
                }
                break;
        }
        let a = e.p;
        o: while (1) {
            if (sp > e.sp) break; else e.sp += 1;
            switch (e.p) {
                case 10:
                    s = State5(l, e, s);
                    break;
                case 9:
                    s = State2(l, e, s);
                    if (e.p < 0)
                        s = State3(l, e, s);
                    else break;
                    break;
                case 8:
                    s = State4(l, e, s);
                    if (e.p < 0)
                        s = State15(l, e, s);
                    else break;
                    break;
                case 7:
                    s = State1(l, e, s);
                    if (e.p < 0)
                        s = State18(l, e, s);
                    else break;
                    break;
                default: break o;
            }
            if (e.p >= 0) a = e.p;
        }
        if (sp <= e.sp) e.p = a;
        if (![6].includes(a)) fail(l, e);
        return s;
    }
    function State1(l, e, s = []) {
        e.p = -1;
        if ([")", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 1;
            return (e.p = 6, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State2(l, e, s = []) {
        e.p = -1;
        if ([")", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 1;
            return (e.p = 6, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State3(l, e, s = []) {
        e.p = -1;
        switch (l.tx) {
            case "*":
                return State7(l, e, _s(s, l, e, e.eh, [8, 256]));
            case ")":
            case "+":
            case ",":
            case ";":
            case ">":
                e.sp -= 1;
                return (e.p = 8, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State4(l, e, s = []) {
        e.p = -1;
        switch (l.tx) {
            case "+":
                return State14(l, e, _s(s, l, e, e.eh, [8, 256]));
            case ")":
            case ",":
            case ";":
            case ">":
                e.sp -= 1;
                return (e.p = 7, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State5(l, e, s = []) {
        e.p = -1;
        if ([")", "*", "+", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 1;
            return (e.p = 9, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State6(l, e, s = []) {
        e.p = -1;
        if ([")", "*", "+", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 1;
            return (e.p = 10, (s.splice(-1, 1, s[s.length - 1]), s));
        }
        return s;
    }
    function State7(l, e, s = []) {
        s.push($mult(l, e, s));
        e.sp++;
        s = State15(l, e, s);
        return s;
    }
    function $expression_list_HC_listbody3_100(l, e, s = []) {
        const sp = e.sp;
        e.p = -1;
        if ([2].includes(l.ty)) {
            s = State6(l, e, _s(s, l, e, e.eh, [8, 256]));
        }
        let a = e.p;
        o: while (1) {
            if (sp > e.sp) break; else e.sp += 1;
            switch (e.p) {
                case 10:
                    s = State5(l, e, s);
                    break;
                case 9:
                    s = State2(l, e, s);
                    if (e.p < 0)
                        s = State3(l, e, s);
                    else break;
                    break;
                case 8:
                    s = State4(l, e, s);
                    break;
                case 7:
                    s = State1(l, e, s);
                    break;
                case 6:
                    s = State10(l, e, s);
                    break;
                case 4:
                    s = State9(l, e, s);
                    break;
                default: break o;
            }
            if (e.p >= 0) a = e.p;
        }
        if (sp <= e.sp) e.p = a;
        if (![4].includes(a)) fail(l, e);
        return s;
    }
    function State9(l, e, s = []) {
        e.p = -1;
        if ([","].includes(l.tx)) {
            return State16(l, e, _s(s, l, e, e.eh, [8, 256]));
        }
        return s;
    }
    function State10(l, e, s = []) {
        e.p = -1;
        if ([","].includes(l.tx)) {
            e.sp -= 1;
            var sym = s.slice(-1);
            s.splice(-1, 1, [sym[0]]);
            return (e.p = 4, s);
        }
        return s;
    }
    function $expression_list(l, e, s = []) {
        const sp = e.sp;
        e.p = -1;
        if ([2].includes(l.ty)) {
            s = State6(l, e, _s(s, l, e, e.eh, [8, 256]));
        }
        let a = e.p;
        o: while (1) {
            if (sp > e.sp) break; else e.sp += 1;
            switch (e.p) {
                case 10:
                    s = State5(l, e, s);
                    break;
                case 9:
                    s = State2(l, e, s);
                    if (e.p < 0)
                        s = State3(l, e, s);
                    else break;
                    break;
                case 8:
                    s = State4(l, e, s);
                    break;
                case 7:
                    s = State1(l, e, s);
                    break;
                case 6:
                    s = State13(l, e, s);
                    break;
                case 5:
                    s = State12(l, e, s);
                    break;
                default: break o;
            }
            if (e.p >= 0) a = e.p;
        }
        if (sp <= e.sp) e.p = a;
        if (![5].includes(a)) fail(l, e);
        return s;
    }
    function State14(l, e, s = []) {
        s.push($add(l, e, s));
        e.sp++;
        s = State18(l, e, s);
        return s;
    }
    function State15(l, e, s = []) {
        e.p = -1;
        if ([")", "+", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 3;
            var sym = s.slice(-3);
            s.splice(-3, 3, { type: "MUL", l: sym[0], r: sym[2] });
            return (e.p = 8, s);
        }
        return s;
    }
    function State16(l, e, s = []) {
        const sp = e.sp;
        e.p = -1;
        if ([2].includes(l.ty)) {
            s = State6(l, e, _s(s, l, e, e.eh, [8, 256]));
        }
        let a = e.p;
        o: while (1) {
            if (sp > e.sp) break; else e.sp += 1;
            switch (e.p) {
                case 10:
                    s = State5(l, e, s);
                    break;
                case 9:
                    s = State2(l, e, s);
                    if (e.p < 0)
                        s = State3(l, e, s);
                    else break;
                    break;
                case 8:
                    s = State4(l, e, s);
                    break;
                case 7:
                    s = State1(l, e, s);
                    break;
                case 6:
                    s = State19(l, e, s);
                    break;
                default: break o;
            }
            if (e.p >= 0) a = e.p;
        }
        if (sp <= e.sp) e.p = a;
        if (![4].includes(a)) fail(l, e);
        return s;
    }
    function State18(l, e, s = []) {
        e.p = -1;
        if ([")", ",", ";", ">"].includes(l.tx)) {
            e.sp -= 3;
            var sym = s.slice(-3);
            s.splice(-3, 3, { type: "ADD", l: sym[0], r: sym[2] });
            return (e.p = 7, s);
        }
        return s;
    }
    function State19(l, e, s = []) {
        e.p = -1;
        if ([","].includes(l.tx)) {
            e.sp -= 3;
            var sym = s.slice(-3);
            s.splice(-3, 3, ([...sym[0], sym[2]]));
            return (e.p = 4, s);
        }
        return s;
    }

    return Object.assign(function (lexer, env = {
        error: [],
        eh: (lex, e) => { },
        sp: 0,
        asi: (lex, env, s) => { }
    }) {

        env.FAILED = false;
        lexer.IWS = false;
        lexer.PARSE_STRING = true;

        lexer.tl = 0;

        env.fn = {
            parseString(lex, env, symbols, LR) {
                const copy = lex.copy();
                while (lex.tx != '"' && !lex.END) {
                    if (lex.tx == "\\") lex.next();
                    lex.next();
                }
                symbols[LR ? symbols.length - 1 : 0] = lex.slice(copy);
            }
        };
        _(lexer, env, env.eh, []);
        const result = $S(lexer, env);

        if (!lexer.END || (env.FAILED)) {

            const error_lex = env.error.concat(lexer).sort((a, b) => a.off - b.off).pop();
            error_lex.throw(`Unexpected token [${error_lex.tx}]`);

        }
        return result;
    });
}