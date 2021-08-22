
import {
    ParserFactoryGamma as ParserFactory
} from "@candlelib/hydrocarbon";
import URI from "@candlelib/uri";;

const wasm_recognizer = URI.resolveRelative("./table_code.wasm", URI.getEXEURL(import.meta)),

    reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1] }) /*0*/,
    (env, sym, pos) => ({ type: "state", id: sym[0] }) /*1*/,
    (env, sym, pos) => (sym[2]) /*2*/,
    (env, sym, pos) => ([sym[0]]) /*3*/,
    (env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*4*/,
    (env, sym, pos) => ({ type: "prod", instructions: sym[4] }) /*5*/,
    (env, sym, pos) => ({ type: "shift", ids: sym[1] }) /*6*/,
    (env, sym, pos) => ({ type: "goto", ids: sym[1] }) /*7*/,
    (env, sym, pos) => ({ type: "goto", state: sym[1] }) /*8*/,
    (env, sym, pos) => ({ type: "goto", len: sym[1], reduce_fn: sym[2] }) /*9*/,
    (env, sym, pos) => ({ type: "set-prod", prod: sym[1] }) /*10*/,
    (env, sym, pos) => ({ type: "id-list", ids: sym[1] }) /*11*/,
    (env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*12*/];

export default ParserFactory
    (reduce_functions, wasm_recognizer, undefined, { start: 0 });