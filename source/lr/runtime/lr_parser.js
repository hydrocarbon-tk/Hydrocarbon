import {
    ERROR,
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK
} from "../common/state_action_enums.js";

function deepClone(obj, visited = new Map()) {

    const proto = Object.getPrototypeOf(obj) || Object;

    let out = Object.create(proto);

    if (Array.isArray(obj))
        out = obj.slice();

    for (const key of Object.getOwnPropertyNames(obj)) {
        const description = Object.getOwnPropertyDescriptor(obj, key);

        const val = description.value;

        if (val && typeof val == "object") {

            if (!visited.has(val)) {
                visited.set(val, null);
                visited.set(val, deepClone(val, visited));
            }

            description.value = visited.get(val);
        }

        Object.defineProperty(out, key, description);
    }

    return out;
}

/*
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    l: Lexer - lexer object with an interface defined in candlefw/whind.
    e: Environment object containing user defined parse action functions.
    entry: the starting state in the parse table. 
    data: parser data including look up tables and default parse action functions.
*/
function parser(l, data = null, e = {}, entry = 0, sp = 1, len = 0, off = 0, o = [], state_stack = [0, entry], SKIP_LEXER_SETUP = false, max_cycles = 600000, previous_forked_state = 0, fork_stack = []) {

    if (!data)
        return { result: [], error: "Data object is empty" };

    //Unwrap parser objects
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
    } = data;

    let cycles = max_cycles;

    const { sym, keyword, any, num } = types;

    if (!SKIP_LEXER_SETUP) {
        l.IWS = false;
        l.PARSE_STRING = true;
        if (symbols.length > 0) {
            symbols.forEach(s => { l.addSymbol(s) });
            l.tl = 0;
            l.next();
        }
    }



    if (!e.fn)
        e.fn = e.functions;

    let RECOVERING = 100,
        tk = getToken(l, token_lu),
        p = l.copy();
    try {


        outer:

            while (cycles-- > 0) {

                const
                    map = states[state_stack[sp]],
                    fn = (tk < map.length) ? map[tk] : -1;

                let r,
                    gt = -1;

                if (fn == 0) {
                    /*Ignore the token*/
                    tk = getToken(l.next(), token_lu);

                    continue;
                }

               // console.log(`[${l.tx}]`,off);

                if (fn > 0) {
                    r = state_actions[fn - 1](tk, e, o, l, state_stack[sp - 1], state_action_functions, parser);
                } else {

                    if (tk == keyword) {
                        //If the keyword is a number, convert to the number type.
                        if (l.ty == num)
                            tk = getToken(l, token_lu, true);
                        else
                            tk = token_lu.get(l.tx);
                        continue;
                    }
                    //*//
                    if (l.ty == sym && l.tl > 1) {
                        // Make sure that special tokens are not getting in the way
                        l.tl = 0;
                        // This will skip the generation of a custom symbol
                        l.next(l, false);

                        if (l.tl == 1)
                            continue;
                    }

                    if (RECOVERING > 1 && !l.END) {

                        if (tk !== token_lu.get(l.ty)) {
                            tk = token_lu.get(l.ty);
                            continue;
                        }

                        if (!(l.ty & (l.types.ws | l.types.nl | l.types.sym))) {
                            l.tl = 1;
                            l.type = l.types.sym;
                            tk = token_lu.get(l.tx);
                            continue;
                        }

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

                    const recovery_token = error_handlers[state_stack[sp]](tk, e, o, l, p, state_stack[sp], (lex) => getToken(lex, token_lu));

                    if (recovery_token >= 0) {
                        RECOVERING = 100;
                        tk = recovery_token;
                        continue;
                    }
                }

                switch (r & 7) {
                    case ERROR: // 0
                        //IF START IS NOT AT THE HEAD TRY REDUCING INSTEAD;
                        /* ERROR */

                        if (tk == "$eof") {
                            if (e.err_eof && (tk = e.err_eof(tk, o, l, p)))
                                continue;
                            else
                                l.throw("Unexpected end of input");
                        } else {
                            if (e.err_general && (tk = e.err_general(tk, o, l, p)))
                                continue;
                            else
                                l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`);
                        }

                        return { result: o[0], error: true };

                    case ACCEPT:

                        break outer;

                    case SHIFT:

                        o.push(l.tx);
                        state_stack.push(off, r >> 3);
                        sp += 2;
                        l.next();
                        off = l.off;
                        tk = getToken(l, token_lu);
                        RECOVERING++;
                        break;

                    case REDUCE:

                        len = (r & 0x7F8) >> 2;

                        state_stack.length -= len;
                        sp -= len;

                        gt = goto[state_stack[sp]][r >> 11];

                        if (gt < 0)
                            l.throw("Invalid state reached!");

                        state_stack.push(off, gt);

                        sp += 2;

                        break;

                    case FORK:

                        //Look Up Fork productions. 
                        var
                            fork_states_start = r >> 16,
                            fork_states_length = (r >> 3) & 0x1FFF,
                            result = { result: null, error: "", cycles },
                            cpfs = fork_stack;
                          //   console.log("FORK-----------------------------------------------------------------------------------------------", `[${l.tx}]`, l.ty, l.END)


                        for (const state of data.fm.slice(fork_states_start, fork_states_start + fork_states_length)) {
                            
                            const fork_Stack = cpfs.slice();

                            fork_stack.push(state)
                            
                            let
                                res = null,
                                csp = sp,
                                clen = len,
                                gt = 0;

                            const
                                copied_lex = l.copy(),
                                copied_output = o.slice(), //deepClone(o),
                                copied_state_stack = state_stack.slice(),
                                r = state_actions[state - 1](tk, e, copied_output, copied_lex, copied_state_stack[csp - 1], state_action_functions, parser);


                            try {
                                switch (r & 7) {
                                    case SHIFT:

                                        //console.log("SHIFT A ----------------------------------------------", `[${copied_lex.tx}]`, copied_lex.ty, copied_lex.END, copied_lex.off)

                                        copied_output.push(l.tx);

                                        copied_state_stack.push(off, r >> 3);

                                        copied_lex.next();

                                        //console.log("SHIFT B ----------------------------------------------", `[${copied_lex.tx}]`, copied_lex.ty, copied_lex.END, copied_lex.off)

                                        res = parser(copied_lex, data, e, 0, csp + 2, clen, copied_lex.off, copied_output, copied_state_stack, true, cycles-1, state, fork_stack.slice());
                                     
                                        break;

                                    case REDUCE:

                                        clen = (r & 0x7F8) >> 2;

                                        copied_state_stack.length -= clen;

                                        csp -= clen;

                                        gt = goto[copied_state_stack[csp]][r >> 11];

                                        if (gt < 0)
                                            l.throw("Invalid state reached!");

                                        copied_state_stack.push(off, gt);

                                        csp += 2;

                                        res = parser(copied_lex, data, e, 0, csp, clen, off, copied_output, copied_state_stack, true, cycles-1, state, fork_stack.slice() );

                                        break;

                                    default:
                                        console.log("############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ############################################### ERROR ")

                                }

                                if (!res.error) {
                                    return res;
                                }
                              //  console.log("FAIL ----------------------------------------------", `[${copied_lex.tx}]`, copied_lex.ty, copied_lex.END, copied_lex.off, res.error)
                                if (res.cycles <= result.cycles) {
                                    result = res;
                                    result.cycles = res.cycles;
                                }

                            } catch (e) {
                            //    console.log("FAIL ----------------------------------------------", `[${copied_lex.tx}]`, copied_lex.ty, copied_lex.END, copied_lex.off, e.error)
                                if (e.cycles && e.cycles <= result.cycles) {
                                    result.error = e.error;
                                    result.cycles = e.cycles;
                                }
                            }
                        }

                        if (!result.error)
                            result.error = "failed to parse at fork";

                        return result;
                }
            }
    } catch (e) {
        throw { error: e, cycles };
    }

    if(cycles <= 0)
        return { result: o[0], error: "Max Depth Reached", cycles };

    console.log(cycles)
    return { result: o[0], error: false, cycles };
}

export default (lex, data, environment, entry_point) => parser(lex, data, environment, entry_point);

const max = Math.max;

parser.reduce_with_value = parser.rv = (ret, fn, plen, ln, t, e, o, l, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = fn(o.slice(-plen), e, l, s, o, plen);
    o.length = ln + 1;
    return ret;
};

parser.reduce_with_new_value = parser.rnv = (ret, Fn, plen, ln, t, e, o, l, s) => {
    ln = max(o.length - plen, 0);
    o[ln] = new Fn(o.slice(-plen), e, l, s, o, plen);
    o.length = ln + 1;
    return ret;
};

parser.reduce_with_null = parser.rn = (ret, plen, t, e, o) => {
    if (plen > 0) {
        const ln = max(o.length - plen, 0);
        o[ln] = o[o.length - 1];
        o.length = ln + 1;
    }
    return ret;
};

parser.shift_with_function = parser.s = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret);