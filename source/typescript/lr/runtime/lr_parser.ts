import { Lexer } from "@candlefw/wind";

import { StateActionEnumConst } from "../../types/state_action_enums.js";
import { ParserData, OutputStack, ErrorHandler } from "../../types/parser_data.js";
import { ParserSquashResultData } from "../../types/parser_squash_result_data.js";
import { ParserResultData } from "../../types/parser_result_data.js";
import { errorReport } from "./error_report.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { StateStack } from "../../types/state_stack.js";
import { LRState } from "../../types/lr_state.js";
import { Grammar } from "../../types/grammar.js";
import { GenerateActionSequence, ImportStates } from "../script_generation/export_states.js";
import { env } from "process";


const MAX_CYCLES = 50000000;

const default_recovery: ErrorHandler = _ => -1;

/**
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    @param l: Lexer - lexer object with an interface defined in candlefw/wind.
    @param data: parser data that includes the look up tables and built in parse action functions.
    @param e: Environment object containing user defined parse action functions.
*/
function parser<T>(
    lex: Lexer,
    data: ParserData = null,
    e: ParserEnvironment = {},
    debug: DebugInfo = null,
    stack_pointer: number = 1,
    len = 0,
    off = 0,
    o: OutputStack = [],
    state_stack: StateStack = [lex.copy(), 0],
    FORKED_ENTRY = false,
    state_action_lu = 0,
    cycles = 0,
    fork_depth = 0,
    forks = 0,
    history
): ParserResultData<T> | ParserSquashResultData {

    if (!data) return <ParserResultData<T>>{ value: null, error: "Data object is empty" };



    const
        //Unpack parser objects

        {
            gt: goto,
            sym: symbols,
            lu: token_lu,
            sts: states,
            sa: state_action_tables,
            fns: state_action_functions,
            //eh: error_handlers,
            gtk: getToken,
            ty: types,
            fm: fork_maps
        } = data,

        { id: lex_id, sym: lex_sym, num: lex_num, ws: lex_ws, nl: lex_nl } = lex.types,

        { keyword, any, $eof: eof } = types,

        { frrh: first_resort_recovery = default_recovery,
            lrrh: last_resort_recovery = default_recovery
        } = e.functions,
        sym_tk = token_lu.get(lex_sym);

    let
        RECOVERING = -1,
        FIST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET = -1,
        LAST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET = -1,
        tk = 0,
        total_cycles = 0,
        state = null,
        state_length = 0;

    if (!FORKED_ENTRY) {
        lex.IWS = false;
        lex.PARSE_STRING = true;

        if (symbols.length > 0) {
            symbols.forEach(s => { lex.addSymbol(s); });
            lex.tl = 0;
            lex.next();
        }

        tk = getToken(lex, token_lu);

        if (!e.fn)
            e.fn = e.functions;

        state = states[<number>state_stack[stack_pointer]];
        state_length = state.length;
        state_action_lu = (tk < state_length) ? state[tk] : -1;

    } else
        tk = getToken(lex, token_lu);



    const p = lex.copy();

    if (debug) history = [{ lex: lex.copy(), tk }, 0];

    try {

        outer: while ((++total_cycles, cycles++ < MAX_CYCLES)) {

            // Skip this step if we entered this function through a fork. 
            // State action will have been set in the outer scope. 
            let action = 0,
                gt = -1;

            if (state_action_lu == 0) {

                /*Ignore the token*/

                tk = getToken(lex.next(), token_lu);

                state_stack[stack_pointer - 1] = lex.copy();
                //state_stack[stack_pointer - 1].sync(lex);

            } else if (state_action_lu < 0) {

                while (/*intentional*/ 1 /*intentional*/) {

                    if (FIST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET != lex.off) {

                        FIST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET = lex.off;

                        const recovery_token =
                            first_resort_recovery(tk, e, o, lex, p, state_stack, (lex) => getToken(lex, token_lu), stack_pointer);

                        if (recovery_token >= 0) {
                            off = lex.off;
                            RECOVERING = 100;
                            tk = recovery_token;
                            break;
                        }
                    }

                    if (RECOVERING != lex.off && !lex.END) {

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
                        //lex type is not space, new_line
                        //*
                        if (!(lex.ty & (lex_ws | lex_nl)) && lex.tl > 1) {

                            lex.tl = 0;

                            lex.CHARACTERS_ONLY = true;

                            lex.next();

                            lex.CHARACTERS_ONLY = false;

                            tk = getToken(lex, token_lu); /*/

                            if ( !(lex.ty & (lex_ws | lex_nl | lex_sym))) {
                                lex.tl = 1;
                                lex.type = lex_sym;
                                tk = token_lu.get(lex.tx);
                                //*/

                            break;
                        }

                        RECOVERING = lex.off;

                        //Last resort, treat token as the θany type.
                        if (tk !== any) {
                            //Reset the token to the original failing value;
                            lex.tl = 0;
                            lex.next();
                            tk = any;
                            break;
                        }
                    }

                    if (LAST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET != lex.off) {

                        //Reset the token to the original failing value;
                        lex.tl = 0;
                        lex.next();
                        tk = getToken(lex, token_lu);

                        LAST_RESORT_CUSTOM_RECOVERY_LAST_OFFSET = lex.off;

                        const recovery_token =
                            last_resort_recovery(tk, e, o, lex, p, state_stack[stack_pointer], (lex) => getToken(lex, token_lu), stack_pointer);

                        if (recovery_token >= 0) {
                            off = lex.off;
                            tk = recovery_token;
                            break;
                        }
                    }

                    if (debug && fork_depth == 0) createStateTrace(stack_pointer, history, debug);

                    return errorReport(tk, lex, off, cycles, total_cycles, fork_depth);
                }

            } else if (state_action_lu > 0) {

                //###############################################
                //ACTION Function
                //###############################################

                action = state_action_tables[state_action_lu - 1](tk, e, o, lex,
                    <Lexer>state_stack[stack_pointer - 1],
                    state_action_functions, parser);

                // if (total_cycles <= 30)
                //     console.log("start", lex.tx, state_action_lu, action & 7, (history ?? []).length / 2, tk);

                switch (<StateActionEnumConst>action & 7) {

                    case StateActionEnumConst.ERROR: {
                        if (debug && fork_depth == 0) createStateTrace(stack_pointer, history, debug);
                        return errorReport(tk, lex, off, cycles, total_cycles, fork_depth);
                    }

                    case StateActionEnumConst.ACCEPT:
                        break outer;

                    case StateActionEnumConst.SHIFT:

                        RECOVERING = -1;

                        o.push(lex.tx);

                        stack_pointer += 2;

                        lex.next();

                        const shift_copy = lex.copy();

                        if (history)
                            history.push({ lex: shift_copy, forks, fork_depth, tk }, action >> 3);

                        //if (stack_pointer >= state_stack.length)
                        //    state_stack.push(lex.copy(), 0, lex.copy(), 0, lex.copy(), 0, lex.copy(), 0);
                        //
                        //state_stack[stack_pointer - 1].sync(shift_copy);
                        //state_stack[stack_pointer] = (action >> 3);

                        state_stack.push(shift_copy, action >> 3);

                        off = lex.off;

                        tk = getToken(lex, token_lu);


                        break;

                    case StateActionEnumConst.REDUCE:

                        RECOVERING = -1;

                        len = (action & 0x7F8) >> 2;

                        const v_ = stack_pointer - 1;

                        var
                            end = <Lexer>state_stack[stack_pointer - 1],
                            start = <Lexer>state_stack[stack_pointer - len - 1];

                        end.sync(start);

                        state_stack.length -= len;
                        stack_pointer -= len;
                        end.sl = off;

                        gt = goto[<number>state_stack[stack_pointer]][action >> 11];

                        if (gt < 0) lex.throw("Invalid state reached!");

                        const reduce_copy = lex.copy();

                        if (history) history.push({ lex: lex.copy(), forks, fork_depth, tk }, gt);

                        //  if (v_ == 1 + stack_pointer) {
                        //      state_stack[2 + stack_pointer] = gt;
                        //  } else {
                        //      state_stack[1 + stack_pointer].sync(reduce_copy);
                        //      state_stack[1 + stack_pointer].cookie = null;
                        //      state_stack[2 + stack_pointer] = gt;
                        //  }

                        // if (state_stack[2 + stack_pointer - 1].cookie) console.log(2);

                        state_stack.push(reduce_copy, gt);

                        stack_pointer += 2;

                        //if (stack_pointer >= state_stack.length)
                        //    state_stack.push(lex.copy(), 0, lex.copy(), 0, lex.copy(), 0, lex.copy(), 0);

                        if (stack_pointer < fork_depth) {
                            return <ParserSquashResultData>{
                                SQUASH: true,
                                forks,
                                o,
                                sp: stack_pointer,
                                len,
                                tk,
                                ss: state_stack,
                                lex,
                                cycles,
                                total_cycles,
                                off,
                                error: null
                            };
                        }
                        break;

                    case StateActionEnumConst.FORK:

                        //Look Up Fork productions. 
                        var
                            fork_states_start = action >> 16,
                            fork_states_length = (action >> 3) & 0x1FFF,
                            fork_states_end = fork_states_start + fork_states_length,
                            result = <ParserResultData<T> | ParserSquashResultData>{ value: null, error: "", cycles, total_cycles, off };

                        FORKED_ENTRY = true;

                        let i = 0;

                        for (const forked_state_action_lu of fork_maps.slice(fork_states_start, fork_states_end)) {

                            const
                                copied_lex = lex.copy(),
                                copied_output = o.slice(),
                                copied_state_stack = state_stack.slice();

                            if (history)
                                history.push({ lex: copied_lex, forks: i++, fork_depth, }, state_stack[stack_pointer]);

                            const
                                res = parser<T>(
                                    copied_lex,
                                    data,
                                    e,
                                    debug,
                                    stack_pointer,
                                    len,
                                    off,
                                    copied_output,
                                    copied_state_stack,
                                    FORKED_ENTRY,
                                    forked_state_action_lu,
                                    cycles,
                                    stack_pointer,
                                    forks + 1,
                                    history
                                );

                            total_cycles += res.total_cycles;

                            if ((<ParserSquashResultData>res).SQUASH) {

                                const ret = <ParserSquashResultData>res;

                                if (fork_depth > 1 && ret.sp < fork_depth) {
                                    ret.total_cycles += result.total_cycles - ret.total_cycles;
                                    return ret;
                                }

                                state_stack = ret.ss;
                                o = ret.o;
                                lex = ret.lex;
                                stack_pointer = ret.sp;
                                len = ret.len;
                                tk = ret.tk;
                                cycles += ret.cycles - cycles;
                                off = ret.off;

                                state = states[<number>state_stack[stack_pointer]];
                                state_length = state.length;
                                state_action_lu = (tk < state_length) ? state[tk] : -1;

                                continue outer;
                            }

                            if (!res.error) {
                                res.total_cycles = total_cycles;
                                return res;
                            }

                            if (res.off > result.off) {
                                res.total_cycles = total_cycles;
                                result = res;
                            }
                        }

                        if (!result.error)
                            result.error = "Failed to parse at FORK action";


                        if (debug && fork_depth == 0) createStateTrace(stack_pointer, history, debug);

                        return result;
                }
            }
            //Update states values
            state = states[<number>state_stack[stack_pointer]];
            state_length = state.length;
            state_action_lu = (tk < state_length) ? state[tk] : -1;

        }
    } catch (e) {

        if (debug && fork_depth == 0) createStateTrace(stack_pointer, history, debug);

        return <ParserResultData<T>>{
            value: null,
            error: lex.errorMessage(e.message),
            cycles,
            total_cycles,
            off,
            fork_depth
        };
    }

    if (cycles >= MAX_CYCLES) {

        if (debug) createStateTrace(stack_pointer, history, debug);

        return <ParserResultData<T>>{
            value: o[0],
            error: lex.errorMessage(`Max Depth Reached ${{ total_cycles, cycles, fork_depth }}`),
            total_cycles,
            cycles,
            off,
            fork_depth,
            efficiency: cycles / total_cycles
        };
    };

    return <ParserResultData<T>>{
        value: o[0],
        error: "",
        cycles,
        total_cycles,
        off,
        fork_depth,
        forks,
        efficiency: cycles / total_cycles
    };
}

interface DebugInfo {
    urls: string[],

    states: LRState[],
    grammar: Grammar;
}

function createStateTrace(sp: number, history_stack: StateStack, debug: DebugInfo) {
    for (let i = Math.max(0, history_stack.length - 40); i < history_stack.length; i += 2) {
        const
            { lex, forks, fork_depth, tk } = <Lexer>history_stack[i],
            state = <number>history_stack[i + 1];
        console.log(`\n------------------\n index: ${i / 2}; fks:${forks} fkd:${fork_depth}\n tk:[ ${lex.tx}:${tk} ] ${lex.line + 1}:${lex.char}`, GenerateActionSequence(state, debug.states, debug.grammar));
    }
}

/**
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    @param lex: Lexer - lexer object with an interface defined in candlefw/wind.
    @param data: parser data that includes the look up tables and built in parse action functions.
    @param environment: Environment object containing user defined parse action functions.
    @param debug_info: Optional State and Grammar data exported alongside parser data
*/
function lrParse<T>(lex: Lexer | string, data: ParserData, environment: ParserEnvironment, debug_info?: DebugInfo | string): ParserResultData<T> {

    let debug = null;

    if (debug_info)
        debug = ImportStates(debug_info);

    if (!environment) {
        environment = <ParserEnvironment>{
            functions: {},
        };
    }

    if (environment.options && environment.options.onstart)
        environment.options.onstart();

    const res = <ParserResultData<T>>parser<T>((typeof lex == "string") ? new Lexer(lex) : lex, data, environment, debug);

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

export { lrParse };