import {
    ERROR,
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK
} from "../common/state_action_enums.js";

import whind from "@candlefw/whind";

const MAX_CYCLES = 600000;

/*
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    l: Lexer - lexer object with an interface defined in candlefw/whind.
    e: Environment object containing user defined parse action functions.
    entry: the starting state in the parse table. 
    data: parser data including look up tables and default parse action functions.
*/
function parser(l, data = null, e = {}, entry = 0, sp = 1, len = 0, off = 0, o = [], state_stack = [l.copy(), entry], FORKED_ENTRY = false, cycles = 0, fork_depth = 0, forks = 0, state_action = 0) {


    if (!data)
        return { result: [], error: "Data object is empty" };

    //Unpack parser objects
    const {
        gt: goto,
        sym: symbols,
        lu: token_lu,
        sts: states,
        sa: state_actions,
        fns: state_action_functions,
        eh: error_handlers,
        gtk: getToken,
        ty: types,
    } = data,

    { sym: lex_sym, num: lex_num, ws: lex_ws, nl: lex_nl } = l.types,

        { keyword, any } = types;

    if (!FORKED_ENTRY) {
        l.IWS = false;
        l.PARSE_STRING = true;
        if (symbols.length > 0) {
            symbols.forEach(s => { l.addSymbol(s) });
            l.tl = 0;
            l.next();
        }

        if (!e.fn)
            e.fn = e.functions;
    }

    const p = l.copy();

    let RECOVERING = 100,
        FINAL_RECOVERY = false,
        tk = getToken(l, token_lu),
        total_cycles = 0,
        state = states[state_stack[sp]],
        state_length = state.length;

    try {

        outer: while (cycles++ < MAX_CYCLES) {
            total_cycles++;

            if(!FORKED_ENTRY)
                state_action = (tk < state_length) ? state[tk] : -1;
            FORKED_ENTRY = false;

            let action, gt = -1;

            if (state_action == 0) {
                /*Ignore the token*/
                tk = getToken(l.next(), token_lu);
                continue;
            } else if (state_action > 0) {
                action = state_actions[state_action - 1](tk, e, o, l, state_stack[sp - 1], state_action_functions, parser);
            } else {

                if (RECOVERING > 1 && !l.END) {
                    //Treat specialized number forms as regular numbers. 
                    if ((l.ty & lex_num) && (l.ty ^ lex_num)) {
                        tk = 1;
                        continue;
                    }

                    if (tk == keyword) {
                        //If the keyword is a number, convert to the number type.
                        if (l.ty & lex_num)
                            tk = getToken(l, token_lu, true);
                        else
                            tk = token_lu.get(l.tx);
                        continue;
                    }

                    //If token is different when evaluating the lexers type, 
                    //get new token based on lexer type.
                    if (tk !== token_lu.get(l.ty)) {
                        tk = token_lu.get(l.ty);
                        continue;
                    }

                    //Treat token as a 1 character symbol if
                    //lex type is not space, new_line, or symbol.
                    if (!(l.ty & (lex_ws | lex_nl | lex_sym))) {
                        l.tl = 1;
                        l.type = lex_sym;
                        tk = token_lu.get(l.tx);
                        continue;
                    }

                    //Last resrt, treat token as the θany type.
                    if (tk !== any) {
                        tk = any;
                        RECOVERING = 1;
                        continue;
                    }
                }

                //Reset the token to the original failing value;
                l.tl = 0;
                l.next();

                tk = getToken(l, token_lu);

                if (!FINAL_RECOVERY) {
                    const recovery_token = error_handlers[state_stack[sp]](tk, e, o, l, p, state_stack[sp], (lex) => getToken(lex, token_lu));

                    if (recovery_token >= 0) {
                        FINAL_RECOVERY = true;
                        RECOVERING = 100;
                        tk = recovery_token;
                        continue;
                    }
                }
            }

            switch (action & 7) {
                case ERROR:
                    //IF START IS NOT AT THE HEAD TRY REDUCING INSTEAD;
                    if (tk == "$eof") {
                        if (e.err_eof && (tk = e.err_eof(tk, o, l, p)))
                            continue;
                        else
                            return {
                                result: null,
                                error: l.errorMessage("Unexpected end of input"),
                                cycles,
                                total_cycles,
                                off,
                                fork_depth
                            };
                    } else {
                        if (e.err_general && (tk = e.err_general(tk, o, l, p)))
                            continue;
                        else
                            return {
                                result: null,
                                error: l.errorMessage(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`),
                                cycles,
                                total_cycles,
                                off,
                                fork_depth
                            };
                    }

                case ACCEPT:

                    break outer;

                case SHIFT:
                    FINAL_RECOVERY = false;

                    state_stack.push(l.copy(), action >> 3);
                    o.push(l.tx);
                    sp += 2;
                    l.next();
                    off = l.off;
                    tk = getToken(l, token_lu);

                    RECOVERING++;
                    break;

                case REDUCE:
                    FINAL_RECOVERY = false;

                    len = (action & 0x7F8) >> 2;

                    var end = state_stack[sp - 1];
                    var start = state_stack[sp - len - 1];

                    end.sl = end.off;
                    end.sync(start);

                    state_stack.length -= len;
                    sp -= len;
                    end.sl = off;


                    gt = goto[state_stack[sp]][action >> 11];

                    if (gt < 0)
                        l.throw("Invalid state reached!");

                    state_stack.push(l.copy(), gt);

                    sp += 2;

                    if (sp < fork_depth - 1) {
                        return {
                            SQUASH: true,
                            o,
                            sp,
                            len,
                            tk,
                            ss: state_stack,
                            l,
                            cycles,
                            total_cycles,
                            off
                        };
                    }

                    break;

                case FORK:

                    //Look Up Fork productions. 
                    var
                        fork_states_start = r >> 16,
                        fork_states_length = (r >> 3) & 0x1FFF,
                        result = { result: null, error: "", cycles, total_cycles, off };

                    for (const state_action of data.fm.slice(fork_states_start, fork_states_start + fork_states_length)) {

                        let
                            res = null;

                        const
                            copied_lex = l.copy(),
                            copied_output = o.slice(),
                            copied_state_stack = state_stack.slice();

                        res = parser(copied_lex, data, e, 0, sp, len, off, copied_output, copied_state_stack, true, cycles, sp, forks + 1, state_action);

                        if (res.SQUASH) {

                            if (fork_depth > 1 && res.sp < fork_depth) {
                                res.total_cycles += result.total_cycles;
                                return res;
                            }

                            state_stack = res.ss;
                            o = res.o;
                            l = res.l;
                            sp = res.sp;
                            len = res.len;
                            tk = res.tk;
                            cycles = res.cycles;
                            total_cycles += res.total_cycles;
                            off = res.off;

                            continue outer;
                        }

                        result.total_cycles += res.total_cycles;

                        if (!res.error) {
                            res.total_cycles = result.total_cycles;
                            return res;
                        }

                        if (res.off > result.off) {
                            res.total_cycles = result.total_cycles;
                            result = res;
                        }
                    }

                    if (!result.error)
                        result.error = l.errorMessage("failed to parse at fork");

                    return result;

                default:
            }

            //Update state value
            state = states[state_stack[sp]];
            state_length = state.length;
        }

    }
    catch (e) {
        return {
            result: null,
            error: e,
            cycles,
            total_cycles,
            off,
            fork_depth
        };
    }

    if (cycles >= MAX_CYCLES)
        return {
            result: o[0],
            error: l.errorMessage("Max Depth Reached"),
            total_cycles,
            cycles,
            off,
            fork_depth
        };

    return {
        result: o[0],
        error: "",
        cycles,
        total_cycles,
        off,
        fork_depth,
        forks
    };
}

export default (lex, data, environment, entry_point) => {
    const res = parser((typeof lex == "string") ? new whind(lex) : lex, data, environment, entry_point);
    res.efficiency = res.cycles / res.total_cycles * 100;
    return res;
};

const max = Math.max;

parser.reduce_with_value = parser.rv = (fn, plen, ln, t, e, o, l, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = fn(o.slice(-plen), e, l, s, o, plen);
    o.length = ln + 1;
};

parser.reduce_with_new_value = parser.rnv = (Fn, plen, ln, t, e, o, l, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = new Fn(o.slice(-plen), e, l, s, o, plen);
    o.length = ln + 1;
};

parser.reduce_with_null = parser.rn = (plen, t, e, o) => {
    if (plen > 0) {
        const ln = max(o.length - plen, 0);
        o[ln] = o[o.length - 1];
        o.length = ln + 1;
    }
};

parser.shift_with_function = parser.s = (fn, t, e, o, l, s) => (fn(o, e, l, s));