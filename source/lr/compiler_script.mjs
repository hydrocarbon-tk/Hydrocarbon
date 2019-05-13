import { getToken, types } from "../util/common.mjs";


const lookupSparseMap = (index, map) => {
    if (map[0] == 0xFFFFFFFF) return map[index+1];
    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {
        if (ind !== index) {
            if ((n = map[i]) > -1) ind++;
            else ind += -n;
        } else return map[i];
    }
    return -1;
};

var goto, symbols, lu, lsm, state, state_funct, $_any, eh;

function parser(l, e = {}) {
    l.IWS = false;
    l.PARSE_STRING = true;

    if (symbols.length > 0) {
        symbols.forEach(s => { l.addSymbol(s) });
        l.tl = 0;
        l.next();
    }

    const o = [],
        ss = [0, 0];

    let time = 1000000,
        RECOVERING = 100,
        tk = getToken(l, lu),
        p = l.copy(),
        sp = 1,
        len = 0,
        off = 0;

    outer:

        while (time-- > 0) {

            const fn = lsm(tk, state[ss[sp]]) || 0;

            /*@*/// console.log({end:l.END, state:ss[sp], tx:l.tx, ty:l.ty, tk:tk, rev:rlu.get(tk), s_map:state[ss[sp]], res:lsm(tk, state[ss[sp]])});

            let r,
                gt = -1;

            if (fn == 0) {
                /*Ignore the token*/
                l.next();
                tk = getToken(l, lu);
                continue;
            }

            if (fn > 0) {
                r = state_funct[fn - 1](tk, e, o, l, ss[sp - 1]);
            } else {

                if (RECOVERING > 1 && !l.END) {
                    if (tk !== lu.get(l.ty)) {
                        //console.log("ABLE", rlu.get(tk), l.tx, tk )
                        tk = lu.get(l.ty);
                        continue;
                    }

                    if (tk !== $_any) {
                        //console.log("MABLE")
                        tk = $_any;
                        RECOVERING = 1;
                        continue;
                    }
                }

                tk = getToken(l, lu);

                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);

                if (RECOVERING > 0 && typeof(recovery_token) == "string") {
                    RECOVERING = -1; /* To prevent infinite recursion */
                    tk = recovery_token;
                    l.tl = 0; /*reset current token */
                    continue;
                }
            }

            switch (r & 3) {
                case 0:
                    /* ERROR */

                    if (tk == "$")
                        l.throw("Unexpected end of input");
                    l.throw(`Unexpected token [\${RECOVERING ? l.next().tx : l.tx}]`);
                    return [null];

                case 1:
                    /* ACCEPT */
                    break outer;

                case 2:
                    /*SHIFT */
                    o.push(l.tx);
                    ss.push(off, r >> 2);
                    sp += 2;
                    p.sync(l);
                    l.next();
                    off = l.off;
                    tk = getToken(l, lu);
                    RECOVERING++;
                    break;

                case 3:
                    /* REDUCE */

                    len = (r & 0x3FC) >> 1;

                    ss.length -= len;
                    sp -= len;
                    gt = goto[ss[sp]](r >> 10);

                    if (gt < 0)
                        l.throw("Invalid state reached!");

                    ss.push(off, gt);
                    sp += 2;
                    break;
            }
        }
    console.log(time);
    return o[0];
}

function renderSymbols(symbols, verbose = false) {
    return JSON.stringify(symbols);
}

function renderGotoMap(goto_maps, verbose = false) {
    return [...goto_maps.values()].map(v => `gt${v.id} = [${v.goto.join(",")}]`).join((verbose) ? ",\n" : ",");
}

function renderStateMaps(state_maps, verbose = false) {
    return state_maps.map((sm, i) => `sm${i}=${sm}`).join((verbose) ? ",\n" : ",");
}

function renderSymbolLookUp(SYM_LU) {
    return JSON.stringify([...SYM_LU.entries()]);
}

function renderStateFunctions(state_functions, verbose = false) {
    return state_functions.join((verbose) ? ",\n" : ",");
}

function renderErrorHandlers(error_handlers, verbose = false) {
    return error_handlers.join((verbose) ? ",\n" : ",");
}

function renderFunctions(functions, verbose = false) {
    return functions.length > 0 ? "\n" + functions.join((verbose) ? ",\n" : ",") + "," : "";
}

function renderSparseMapFunction(lookupSparseMap) {
    return lookupSparseMap.toString().replace(/(anonymous)?[\n\t]*/g, "");
}

function renderParseFunction(parseFunction, GEN_SYM_LU, verbose = false) {
    const str = parseFunction.toString().replace(/\$_any/g, GEN_SYM_LU.get("any"));

    if (!verbose)
        return str.replace(/\n/g, "");
    return str;
}

function renderGotoFunctions(goto_functions, verbose = false) {
    return goto_functions.join((verbose) ? ",\n" : ",");
}

function renderStateActionFunctions(state_action_functions, verbose = false) {
    return state_action_functions.join((verbose) ? ",\n" : ",");
}

function renderGetTokenFunction(getToken, SYM_LU, verbose = false) {
    const str = getToken.toString().replace(/types\.([^:]*):/g, (match, p1) => {
        return types[p1] + ":";
    }).replace(/"([^"]*)"/g, (match, p1) => {
        return SYM_LU.get(types[p1]) || "$";
    });

    if (!verbose)
        return str.replace(/\/\*@\*\/[^\n]*\n/g,"").replace(/\n/g, "");
    return str;
}

export function verboseCompiler(
    goto_maps,
    state_maps,
    state_functions,
    SYM_LU,
    default_error,
    error_handlers,
    functions,
    state_action_functions,
    goto_functions,
    GEN_SYM_LU,
    symbols) {
    return `const 
/************** Maps **************/

    /* Symbols To Inject into the Lexer */
    symbols = ${renderSymbols(symbols, true)},

    /* Goto lookup maps */
    ${renderGotoMap(goto_maps, true)},

    // State action lookup maps
    ${renderStateMaps(state_maps, true)},

    // Symbol Lookup map
    lu = new Map(${renderSymbolLookUp(SYM_LU, true)}),

    //Reverse Symbol Lookup map
    rlu = new Map(${JSON.stringify([...SYM_LU.entries()].map(e=>[e[1],e[0]]))}),

    // States 
    state = [${renderStateFunctions(state_functions, true)}],

/************ Functions *************/

    max = Math.max,

    //Error Functions
    e = ${default_error}, 
    eh = [${renderErrorHandlers(error_handlers, true)}],

    //Empty Function
    nf = ()=>-1, 

    //Environment Functions
    ${renderFunctions(functions, true)}

    //Sparse Map Lookup
    lsm = ${renderSparseMapFunction(lookupSparseMap, true)},

    //State Action Functions
    state_funct = [${renderStateActionFunctions(state_action_functions, true)}],

    //Goto Lookup Functions
    goto = [${renderGotoFunctions(goto_functions, true)}];

${renderGetTokenFunction(getToken, SYM_LU, true)}

/************ Parser *************/

${renderParseFunction(parser, GEN_SYM_LU, true)}`;
}

export function compressedCompiler(
    goto_maps,
    state_maps,
    state_functions,
    SYM_LU,
    default_error,
    error_handlers,
    functions,
    state_action_functions,
    goto_functions,
    GEN_SYM_LU,
    symbols) {
    return ("const symbols=" +
        `${renderSymbols(symbols)},` +
        `${renderGotoMap(goto_maps)},` +
        `${renderStateMaps(state_maps)},` +
        `lu=new Map(${renderSymbolLookUp(SYM_LU, false)}),` +
        `state = [${renderStateFunctions(state_functions, false)}],max = Math.max,` +
        `e=${default_error},eh=[${renderErrorHandlers(error_handlers, false)}],nf = ()=>-1,` +
        `${renderFunctions(functions, false)}` +
        `lsm=${renderSparseMapFunction(lookupSparseMap, false)},` +
        `state_funct = [${renderStateActionFunctions(state_action_functions, false)}],` +
        `goto = [${renderGotoFunctions(goto_functions, false)}];` +
        renderGetTokenFunction(getToken, SYM_LU, false) +
        renderParseFunction(parser, GEN_SYM_LU, false)).replace(/\s+/g, " ");
}
