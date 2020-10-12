export default function (lexer) {

    function $start(env, s = [], p = -1) {

        env.states.push(0);

        if (env.lex.ty == 1) {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $4(env, s);

            s = val, p = pval;

            while (true) {

                if (p == 3) {

                    const { p: pval, v: val } = $2(env, s);

                    s = val, p = pval;
                }

                if (p == 2) {

                    const { p: pval, v: val } = $3(env, s);

                    s = val, p = pval;
                }

                if (p == 1) {

                    const { p: pval, v: val } = $1(env, s);

                    s = val, p = pval;
                }

                if (env.lex.END) return { p, v: s };
            }

            return { p, v: s };
        }

        env.lex.throw("could not continue parse at state 0");
    }

    function $1(env, s = [], p = -1) {

        env.states.push(1);

        if (env.lex.END) {

            return {

                p: 0,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        env.lex.throw("could not continue parse at state 1");
    }

    function $2(env, s = [], p = -1) {

        env.states.push(2);

        if (env.lex.END) {

            return {

                p: 2,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        if (env.lex.tx == "*") {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $5(env, s);

            s = val, p = pval;

            return { p, v: s };
        }

        if (env.lex.tx == "+") {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $6(env, s);

            s = val, p = pval;

            return { p, v: s };
        }

        env.lex.throw("could not continue parse at state 2");
    }

    function $3(env, s = [], p = -1) {

        env.states.push(3);

        if (env.lex.END) {

            return {

                p: 1,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        env.lex.throw("could not continue parse at state 3");
    }

    function $4(env, s = [], p = -1) {

        env.states.push(4);

        if (env.lex.tx == "*") {

            return {

                p: 3,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        if (env.lex.tx == "+") {

            return {

                p: 3,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        if (env.lex.END) {

            return {

                p: 3,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        env.lex.throw("could not continue parse at state 4");
    }

    function $5(env, s = [], p = -1) {

        env.states.push(5);

        if (env.lex.ty == 1) {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $4(env, s);

            s = val, p = pval;

            while (true) {

                if (p == 3) {

                    const { p: pval, v: val } = $8(env, s);

                    s = val, p = pval;
                }

                if (p == 2) {

                    const { p: pval, v: val } = $7(env, s);

                    s = val, p = pval;
                }

                if (env.lex.END) return { p, v: s };
            }

            return { p, v: s };
        }

        env.lex.throw("could not continue parse at state 5");
    }

    function $6(env, s = [], p = -1) {

        env.states.push(6);

        if (env.lex.ty == 1) {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $4(env, s);

            s = val, p = pval;

            while (true) {

                if (p == 3) {

                    const { p: pval, v: val } = $2(env, s);

                    s = val, p = pval;
                }

                if (p == 2) {

                    const { p: pval, v: val } = $3(env, s);

                    s = val, p = pval;
                }

                if (p == 1) {

                    const { p: pval, v: val } = $9(env, s);

                    s = val, p = pval;
                }

                if (env.lex.END) return { p, v: s };
            }

            return { p, v: s };
        }

        env.lex.throw("could not continue parse at state 6");
    }

    function $7(env, s = [], p = -1) {

        env.states.push(7);

        if (env.lex.END) {

            const sym = s.slice(-3);

            console.log("B", { sym }, { sym: "*", a: sym[0], b: sym[2] }, 7);

            s.splice(-3, 3, { sym: "*", a: sym[0], b: sym[2] });

            return { p: 1, v: s, type: "reduce" };
        }

        env.lex.throw("could not continue parse at state 7");
    }

    function $8(env, s = [], p = -1) {

        env.states.push(8);

        if (env.lex.END) {

            return {

                p: 2,

                v: (s.splice(-1, 1, s[s.length - 1]), s),

                type: "reduce"
            };
        }

        if (env.lex.tx == "+") {

            s.push(env.lex.tx), env.lex.next();

            const { p: pval, v: val } = $6(env, s);

            s = val, p = pval;

            return { p, v: s };
        }

        env.lex.throw("could not continue parse at state 8");
    }

    function $9(env, s = [], p = -1) {

        env.states.push(9);

        if (env.lex.END) {

            const sym = s.slice(-3);

            console.log("B", { sym }, { sym: "+", a: sym[0], b: sym[2] }, 9);

            s.splice(-3, 3, { sym: "+", a: sym[0], b: sym[2] });

            return { p: 2, v: s, type: "reduce" };
        }

        env.lex.throw("could not continue parse at state 9");
    }

    const states = [];

    const val = $start({ lex: lexer, states }).v;

    console.log({ states });

    return val;
};