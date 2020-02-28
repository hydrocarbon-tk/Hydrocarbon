import { getToken, types } from "../../util/common.js";
function renderSymbols(symbols) {
    return JSON.stringify(symbols);
}
function renderGotoMap(goto_maps) {
    return [...goto_maps.values()].map(v => `[${v.goto.join(",")}]`).join(",");
}
function renderStateMaps(state_maps) {
    return state_maps.map((sm) => `[${sm}]`).join(",");
}
function renderForkMap(fork_map) {
    return fork_map.join(",");
}
function renderSymbolLookUp(SYM_LU) {
    return JSON.stringify([...SYM_LU.entries()]);
}
function renderStateFunctions(state_functions) {
    return state_functions.map(s => `${s}`).join(",");
}
function renderErrorHandlers(error_handlers) {
    return error_handlers.map(s => `${s}`).join(",");
}
function renderFunctions(functions) {
    return functions.join(",");
}
function renderGotoMapLU(goto_map_lu) {
    return goto_map_lu.reduce((r, i, l) => (l = r.length - 1, (+r[l] < 0 && i < 0) ? r[l]-- : r.push(i), r), []).join(",");
}
function renderStateActionFunctions(state_action_functions) {
    return state_action_functions.join(",");
}
function renderGetTokenFunction(getToken, SYM_LU, RV_SYM_LU, verbose = false) {
    const str = getToken.toString().replace(/types\.([\w]+)/g, (match, p1) => {
        return types[p1];
    }).replace(/"([^"]*)"/g, (match, p1) => {
        return SYM_LU.get(types[p1] || p1) || RV_SYM_LU.get(p1) || "$eof";
    });
    return str.replace(/\/\*@\*\/[^\n]*\n/g, "").replace(/\n/g, "");
}
export function verboseTemplate(fork_map, goto_maps, state_maps, state_functions, SYM_LU, default_error, error_handlers, functions, state_action_functions, goto_map_lookup, GEN_SYM_LU, symbols) {
    return `((e,s,u,g)=>({
         fn : {}, 
/************** Maps **************/
    st:s,
    /* Types */ ty: {${[...GEN_SYM_LU.entries()].map(e => `${e[0]}:${e[1]}`).join(",")}},
    /* Symbols To Inject into the Lexer */ sym : ${renderSymbols(symbols)},
    /* Symbol Lookup map */ lu : new Map(${renderSymbolLookUp(SYM_LU)}),
    /* Reverse Symbol Lookup map */ rlu : new Map(${JSON.stringify([...SYM_LU.entries()].map(e => [e[1], e[0]]))}),
    /* States */ sts : [${renderStateFunctions(state_functions)}].map(i=>s[i]),
    /* Fork Map */fm: [${renderForkMap(fork_map)}],
    /*Goto Lookup Functions*/ gt:g[0].map(i=>i>=0?u[i]:[]),
/************ Functions *************/
    /* Error Functions */ eh : [${renderErrorHandlers(error_handlers)}],
    /* Environment Functions*/ fns: [${renderFunctions(functions)}],
    /* State Action Functions */ sa : [${renderStateActionFunctions(state_action_functions)}],
    /* Get Token Function  */ gtk:${renderGetTokenFunction(getToken, SYM_LU, GEN_SYM_LU, true)},
}))(${default_error},...([
    [${renderStateMaps(state_maps)}],
    [${renderGotoMap(goto_maps)}],
    [[${renderGotoMapLU(goto_map_lookup)}]]
    ]).map(e=>e.map(s=>s.flatMap(d=> d < 0 ? (new Array(-d)).fill(-1) : d)))
)`;
}
export function compressedTemplate(fork_map = [], goto_maps, state_maps, state_functions, SYM_LU, default_error, error_handlers, functions, state_action_functions, goto_functions, GEN_SYM_LU, symbols) {
    return `((s,e, nf = ()=>{}, st = s.map(s=>s.flatMap(d=> d < 0 ? (new Array(-d)).fill(-1) : d)) )=>({
        st, fn : {}, ty: {${[...GEN_SYM_LU.entries()].map(e => `${e[0]}:${e[1]}`).join(",")}},
    sym : ${renderSymbols(symbols)},
    gt : [${renderGotoMap(goto_maps)}],
    lu : new Map(${renderSymbolLookUp(SYM_LU)}),
    rlu : new Map(${JSON.stringify([...SYM_LU.entries()].map(e => [e[1], e[0]]))}),
    sts : [${renderStateFunctions(state_functions)}],
    fm: [${renderForkMap(fork_map)}],
    eh : [${renderErrorHandlers(error_handlers)}],
    fns: [${renderFunctions(functions)}],
    sa : [${renderStateActionFunctions(state_action_functions)}],
    gtk:${renderGetTokenFunction(getToken, SYM_LU, GEN_SYM_LU, true)},
    gta : [${renderGotoMapLU(goto_functions)}]
}))([${renderStateMaps(state_maps)}],${default_error})`;
}
