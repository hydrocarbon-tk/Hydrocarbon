
import {
    ParserFactoryGamma as ParserFactory
} from "@candlelib/hydrocarbon";
import URI from "@candlelib/uri";;

const wasm_recognizer = URI.resolveRelative("./table_code.wasm", URI.getEXEURL(import.meta)),

    reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: sym[2] }) /*0*/,
    (env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: null }) /*1*/,
    (env, sym, pos) => (sym[2]) /*2*/,
    (env, sym, pos) => ([sym[0]]) /*3*/,
    (env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*4*/,
    (env, sym, pos) => ({ type: "prod", ids: sym[2], instructions: sym[4] }) /*5*/,
    (env, sym, pos) => ({ type: "shift", ids: sym[1], goto_state: sym[3] }) /*6*/,
    (env, sym, pos) => ({ type: "goto", ids: sym[1], goto_state: sym[3] }) /*7*/,
    (env, sym, pos) => ({ type: "goto", state: sym[1] }) /*8*/,
    (env, sym, pos) => ({ type: "goto", len: sym[1], reduce_fn: sym[2] }) /*9*/,
    (env, sym, pos) => ({ type: "set-prod", id: sym[3] }) /*10*/,
    (env, sym, pos) => ({ type: "fork-to", states: sym[3] }) /*11*/,
    (env, sym, pos) => ({ type: "symbols", expected: sym[3], skipped: sym[5] || [] }) /*12*/,
    (env, sym, pos) => ({ type: "symbols", expected: sym[3], skipped: null || [] }) /*13*/,
    (env, sym, pos) => ({ type: "id-list", ids: sym[1] }) /*14*/,
    (env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*15*/];

export default ParserFactory
    (reduce_functions, wasm_recognizer, undefined, { start: 0 });