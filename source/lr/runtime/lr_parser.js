import {
    ERROR,
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK
} from "../common/state_action_enums.js";

import whind from "@candlefw/whind";

const MAX_CYCLES = 600000;

function errorReport(env, tk, lex, off, cycles, total_cycles, fork_depth, eof) {
    if (tk == eof) {
        return {
            result: null,
            error: lex.errorMessage("Unexpected end of input"),
            cycles,
            total_cycles,
            off,
            fork_depth
        };
    } else {
        return {
            result: null,
            error: lex.errorMessage(`Unexpected token [${lex.tx}]`),
            cycles,
            total_cycles,
            off,
            fork_depth
        };
    }
}

/*
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    l: Lexer - lexer object with an interface defined in candlefw/whind.
    e: Environment object containing user defined parse action functions.
    entry: the starting state in the parse table. 
    data: parser data including look up tables and default parse action functions.
*/
function parser(lex, data = null, e = {}, sp = 1, len = 0, off = 0, o = [], state_stack = [lex.copy(), 0], FORKED_ENTRY = false, state_action_lu = 0, cycles = 0, fork_depth = 0, forks = 0) {


    if (!data) return { result: [], error: "Data object is empty" };

    //Unpack parser objects
    const {
        gt: goto,
        sym: symbols,
        lu: token_lu,
        sts: states,
        sa: state_action_tables,
        fns: state_action_functions,
        eh: error_handlers,
        gtk: getToken,
        ty: types,
    } = data,

    { sym: lex_sym, num: lex_num, ws: lex_ws, nl: lex_nl } = lex.types,

        { keyword, any, $eof: eof } = types;


    let RECOVERING = 100,
        FINAL_RECOVERY = false,
        tk = 0,
        total_cycles = 0,
        state = null,
        state_length = 0;

    if (!FORKED_ENTRY) {
        lex.IWS = false;
        lex.PARSE_STRING = true;
        
        if (symbols.length > 0) {
            symbols.forEach(s => { lex.addSymbol(s) });
            lex.tl = 0;
            lex.next();
        }

        if (!e.fn)
            e.fn = e.functions;

        state = states[state_stack[sp]];
        state_length = state.length;
        tk = getToken(lex, token_lu);
        state_action_lu = (tk < state_length) ? state[tk] : -1;
    }

    const p = lex.copy();

    try {

        outer: while ((++total_cycles, cycles++ < MAX_CYCLES)) {


            // Skip this step if we entered this function through a fork. 
            // State action will have been set in the outer scope. 
            let action = 0,
                gt = -1;

            if (state_action_lu == 0) {
                /*Ignore the token*/
                tk = getToken(lex.next(), token_lu);
            } else if (state_action_lu < 0) {
                while (true) {

                    if (RECOVERING > 1 && !lex.END) {
                        //Treat specialized number forms as regular numbers. 
                        if ((lex.ty & lex_num) && (lex.ty ^ lex_num)) {
                            tk = 1;
                            break;
                        }
                        // If the tk is keyword type and
                        // lex.type is a number, convert to the number token 
                        // or convert keyword type to its literal type
                        if (tk == keyword) {
                            if (lex.ty & lex_num)
                                tk = getToken(lex, token_lu, true);
                            else
                                tk = token_lu.get(lex.tx);
                            break;
                        }
                        //If token is different when evaluating the lexers type, 
                        //get new token based on lexer type.
                        if (tk !== token_lu.get(lex.ty)) {
                            tk = token_lu.get(lex.ty);
                            break;
                        }

                        //Treat token as a 1 character symbol if
                        //lex type is not space, new_line, or symbol
                        if (!(lex.ty & (lex_ws | lex_nl | lex_sym))) {
                            lex.tl = 1;
                            lex.type = lex_sym;
                            tk = token_lu.get(lex.tx);
                            break;
                        }
                        //Last resort, treat token as the θany type.
                        if (tk !== any) {
                            tk = any;
                            RECOVERING = 1;
                            break;
                        }
                    }
                    //Reset the token to the original failing value;
                    lex.tl = 0;
                    lex.next();
                    tk = getToken(lex, token_lu);

                    if (!FINAL_RECOVERY) {
                        
                        const recovery_token = error_handlers[state_stack[sp]](tk, e, o, lex, p, state_stack[sp], (lex) => getToken(lex, token_lu));
                        
                        if (recovery_token >= 0) {
                            FINAL_RECOVERY = true;
                            RECOVERING = 100;
                            tk = recovery_token;
                            break;
                        }

                    }   

                    return errorReport(e, tk, lex, off, cycles, total_cycles, fork_depth, eof);

                }

            } else if (state_action_lu > 0) {

                action = state_action_tables[state_action_lu - 1](tk, e, o, lex, state_stack[sp - 1], state_action_functions, parser);

                switch (action & 7) {

                    case ERROR:
                        return errorReport(e, tk, lex, off, cycles, total_cycles, fork_depth, eof);

                    case ACCEPT:
                        break outer;

                    case SHIFT:

                        state_stack.push(lex.copy(), action >> 3);
                        o.push(lex.tx);
                        sp += 2;
                        lex.next();
                        off = lex.off;
                        tk = getToken(lex, token_lu);

                        RECOVERING++;

                        break;

                    case REDUCE:

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
                            lex.throw("Invalid state reached!");

                        state_stack.push(lex.copy(), gt);

                        sp += 2;

                        if (sp < fork_depth - 1) {
                            return {
                                SQUASH: true,
                                o,
                                sp,
                                len,
                                tk,
                                ss: state_stack,
                                lex,
                                cycles,
                                total_cycles,
                                off
                            };
                        }
                        break;

                    case FORK:

                        //Look Up Fork productions. 
                        var
                            fork_states_start = action >> 16,
                            fork_states_length = (action >> 3) & 0x1FFF,
                            fork_states_end = fork_states_start + fork_states_length,
                            result = { result: null, error: "", cycles, total_cycles, off };

                        FORKED_ENTRY = true;

                        for (const forked_state_action_lu of data.fm.slice(fork_states_start, fork_states_end)) {

                            const
                                copied_lex = lex.copy(),
                                copied_output = o.slice(),
                                copied_state_stack = state_stack.slice(),
                                res = parser(
                                    copied_lex,
                                    data,
                                    e,
                                    sp,
                                    len,
                                    off,
                                    copied_output,
                                    copied_state_stack,
                                    FORKED_ENTRY,
                                    forked_state_action_lu,
                                    cycles,
                                    sp,
                                    forks + 1
                                );

                            if (res.SQUASH) {

                                if (fork_depth > 1 && res.sp < fork_depth) {
                                    res.total_cycles += result.total_cycles;
                                    return res;
                                }

                                state_stack = res.ss;
                                o = res.o;
                                lex = res.lex;
                                sp = res.sp;
                                len = res.len;
                                tk = res.tk;
                                cycles = res.cycles;
                                total_cycles += res.total_cycles;
                                off = res.off;

                                state = states[state_stack[sp]];
                                state_length = state.length;
                                state_action_lu = (tk < state_length) ? state[tk] : -1;

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
                            result.error = lex.errorMessage("Failed to parse at FORK action");

                        return result;
                }
            }
            FINAL_RECOVERY = false;
            //Update states values
            state = states[state_stack[sp]];
            state_length = state.length;
            state_action_lu = (tk < state_length) ? state[tk] : -1;
        }
    } catch (e) {
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
            error: lex.errorMessage("Max Depth Reached"),
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

parser.reduce_with_value = parser.rv = (fn, plen, ln, t, e, o, lex, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = fn(o.slice(-plen), e, lex, s, o, plen);
    o.length = ln + 1;
};

parser.reduce_with_new_value = parser.rnv = (Fn, plen, ln, t, e, o, lex, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = new Fn(o.slice(-plen), e, lex, s, o, plen);
    o.length = ln + 1;
};

parser.reduce_with_null = parser.rn = (plen, t, e, o) => {
    if (plen > 0) {
        const ln = max(o.length - plen, 0);
        o[ln] = o[o.length - 1];
        o.length = ln + 1;
    }
};

parser.shift_with_function = parser.s = (fn, t, e, o, lex, s) => (fn(o, e, lex, s));