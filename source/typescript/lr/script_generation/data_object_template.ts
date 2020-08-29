import { getToken, types } from "../../util/common.js";
import { fillAndCompress } from "./fill_and_compress.js";

function renderSymbols(symbols) {
    return JSON.stringify(symbols);
}

function renderGotoMap(goto_maps) {
    return [...goto_maps.values()].map(v => `${v.goto}`).join("&");
}

function renderStateMaps(state_maps) {
    return state_maps.map((sm) => `${sm}`).join("&");
}

function renderGotoMapLU(goto_map_lu) {
    return `${fillAndCompress(goto_map_lu)}`;
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

function renderFunctions(functions) {
    return functions.join(",");
}

function renderStateActionFunctions(state_action_functions) {
    return state_action_functions.join(",");
}

function renderGetTokenFunction(getToken, SYM_LU, RV_SYM_LU) {
    const str = getToken.toString().replace(/types\.([\w]+)/g, (match, p1) => {
        return types[p1];
    }).replace(/"([^"]*)"/g, (match, p1) => {
        return SYM_LU.get(types[p1] || p1) || RV_SYM_LU.get(p1) || "$eof";
    });
    return str.replace(/\/\*@\*\/[^\n]*\n/g, "").replace(/\n/g, "");
}

export function verboseTemplate(
    fork_map,
    goto_maps,
    state_maps,
    state_functions,
    SYM_LU,
    functions,
    state_action_functions,
    goto_map_lookup,
    GEN_SYM_LU,
    symbols
) {
    const str = `((s,u,g)=>({
         fn : {}, 
/************** Maps **************/
    st:s,
    /* Types */ ty: {${[...GEN_SYM_LU.entries()].map(e => `${e[0]}:${e[1]}`).join(",")}},
    /* Symbols To Inject into the Lexer */ sym : ${renderSymbols(symbols)},
    /* Symbol Lookup map */ lu : new Map(${renderSymbolLookUp(SYM_LU)}),
    /* States */ sts : [${renderStateFunctions(state_functions)}].map(i=>s[i]),
    /* Fork Map */fm: [${renderForkMap(fork_map)}],
    /*Goto Lookup Functions*/ gt:g[0].map(i=>i>=0?u[i]:[]),
/************ Functions *************/
    /* Environment Functions*/ fns: [${renderFunctions(functions)}],
    /* State Action Functions */ sa : [${renderStateActionFunctions(state_action_functions)}],
    /* Get Token Function  */ gtk:${renderGetTokenFunction(getToken, SYM_LU, GEN_SYM_LU)},
}))(...("${renderStateMaps(state_maps)}|${renderGotoMap(goto_maps)}|${renderGotoMapLU(goto_map_lookup)}")`
        + `.split("|").map(e=>e.split("&")).map(a => a.map(s => s.split(";").map(s=>parseInt(s,36)))`
        + `.map(s=>s.flatMap(d=>d<0?(new Array(-d-1)).fill(-1):(new Array(((d >>> 15) & 0x3FF) + 1)).fill((d >>> 1) & 0x3FFF)))))`;
    return str;
}
export function compressedTemplate(
    fork_map,
    goto_maps,
    state_maps,
    state_functions,
    SYM_LU,
    functions,
    state_action_functions,
    goto_map_lookup,
    GEN_SYM_LU,
    symbols
) {
    const str = `((s,u,g)=>({fn:{},st:s,ty:{${[...GEN_SYM_LU.entries()].map(e => `${e[0]}:${e[1]}`).join(",")}},sym:${renderSymbols(symbols)},
    lu:new Map(${renderSymbolLookUp(SYM_LU)}),sts:[${renderStateFunctions(state_functions)}].map(i=>s[i]),fm:[${renderForkMap(fork_map)}],
    gt:g[0].map(i=>i>=0?u[i]:[]),fns:[${renderFunctions(functions)}],sa:[${renderStateActionFunctions(state_action_functions)}],
    gtk:${renderGetTokenFunction(getToken, SYM_LU, GEN_SYM_LU)},}))(...("${renderStateMaps(state_maps)}|${renderGotoMap(goto_maps)}|${renderGotoMapLU(goto_map_lookup)}")`
        + `.split("|").map(e=>e.split("&")).map(a => a.map(s => s.split(";").map(s=>parseInt(s,36)))`
        + `.map(s=>s.flatMap(d=>d<0?(new Array(-d-1)).fill(-1):(new Array(((d >>> 15) & 0x3FF) + 1)).fill((d >>> 1) & 0x3FFF)))))`;
    return str;
}
