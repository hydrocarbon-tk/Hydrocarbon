/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { getToken, types, FOLLOW, filloutGrammar } from "../common2.mjs";

import createSparseStateMaps from "./sparse_state_maps.mjs";

const lookupSparseMap = (index, map) => {
    if (map[0] > 0xFFFFFFFF) return map[index];
    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {
        if (ind !== index) {
            if ((n = map[i]) > -1) ind++;
            else ind += -n;
        } else return map[i];
    }
    return -1;
}

function parseBodyFunctions(grammar, functions, ) {

}

export function LRParserCompiler(states, grammar, env) {
    //Build new env variables if they are missing 

    if (!grammar.bodies) {
        filloutGrammar(grammar, env);
    }

    if (states.type !== "lr") {
        throw new Error("");
    }

    const GEN_SYM_LU = new Map();

    let n = 0;

    for (let a in types)
        GEN_SYM_LU.set(a, (((n++) / 2) | 0) + 1)

    GEN_SYM_LU.set("any", 13);


    //parse body function
    const
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : false,
        functions = [],
        error_handlers = [],
        SYMBOL_INDEX_OFFSET = 14, //Must leave room for symbol types indices
        //Convert all terminals to indices and create lookup map for terminals
        SYM_LU = new Map([
            ...[...GEN_SYM_LU.entries()].map(e => [types[e[0]], e[1]]),
            ...[...grammar.meta.symbols.values()].map((e, i) => ([(e.type == "generated") ? types[e.val] : e.val, (e.type == "generated") ? GEN_SYM_LU.get(e.val) : i + SYMBOL_INDEX_OFFSET]))
        ]),


        { state_functions, goto_functions, state_str_functions, state_maps, goto_maps } = createSparseStateMaps(grammar, states, env, functions, SYM_LU);

    for (let i = 0; i < states.length; i++) {
        let production = grammar.bodies[states[i].body].production;
        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }
    }

    if (env.functions) {
        for (let n in env.functions) {
            const funct = env.functions[n];

            if (COMPILE_FUNCTION || funct.INTEGRATE)
                functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }
    }

    let default_error = `(tk,r,o,l,s)=>{
        if(l.END)
            l.throw("Unexpected end of input");
        else
            l.throw(\`unexpected token \${l.tx} on input \${s} \`)
    }`;

    if (env.functions.defaultError)
        default_error = env.functions.defaultError.toString().replace(/(anonymous)?[\n\t]*/g, "");

    const output = verboseCompiler(
        goto_maps,
        state_maps,
        state_functions,
        SYM_LU,
        default_error,
        error_handlers,
        functions,
        state_str_functions,
        goto_functions,
        GEN_SYM_LU,
        [...grammar.meta.symbols.values()].map(e=>e.val));
    //console.log(output);
    return output;
}


function verboseCompiler(
    goto_maps,
    state_maps,
    state_functions,
    SYM_LU,
    default_error,
    error_handlers,
    functions,
    state_str_functions,
    goto_functions,
    GEN_SYM_LU,
    symbols) {
    return `const 

/* Maps */

symbols = ${JSON.stringify(symbols)},

// Goto lookup maps
${[...goto_maps.values()].map(v => `gt${v.id} = [${v.goto.join(",")}]`).join(",\n")},

// State action lookup maps
${state_maps.map((sm, i) => `sm${i}=${sm}`).join(",\n")},

// Symbol Lookup map
lu = new Map(${JSON.stringify([...SYM_LU.entries()])}),

// States 
state = [${state_functions.join(",\n")}],

/* Functions */

max = Math.max,

//Error Functions
e = ${default_error}, 
eh = [${error_handlers.join(",\n")}],

//Empty Function
nf = ()=>-1, 

//Environment Functions
${functions.length > 0 ? "\n" + functions.join(",\n") +",": "" }

//Sparse Map Lookup
lsm = ${lookupSparseMap.toString().replace(/(anonymous)?[\n\t]*/g,"")},

//State Action Functions
state_funct = [${state_str_functions.join(",\n")}],

//Goto Lookup Functions
goto = [${goto_functions.join(",\n")}];

${getToken.toString().replace(/types\.([^:]*):/g, (match, p1)=>{
    return types[p1] + ":";
}).replace(/"([^"]*)"/g, (match, p1)=>{
    return SYM_LU.get(types[p1]) || "$";
})}

 function parser(l, e = {}){
    l.IWS = false;
    //*
    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s)});
        l.tl = 0;
        l.next();
    }
    //*/

    const o = [], ss = [0,0];
    
    let time = 1000000, RECOVERING = 1,
        tk = getToken(l, lu), p = l.copy(), sp = 1, len = 0, off= 0;
    
    outer:

    while(time-- > 0){

        let fn = lsm(tk, state[ss[sp]]) || 0, r, st = 0, gt = -1, c = 0;

        if(fn == 0){
            //Ignore the token
            l.next();
            tk = getToken(l, lu);
            continue;
        }

        console.log(o)

        if(fn > 0){
            r = state_funct[fn-1](tk, e, o, l, ss[sp-1]);
        } else {

            if(RECOVERING > 1){
                if(tk !== lu.get(l.ty)){
                    RECOVERING = 0;
                    tk = l.ty;
                    continue;
                }

                if(tk !== ${GEN_SYM_LU.any}){
                    tk = ${GEN_SYM_LU.any};
                    RECOVERING = 1;
                    continue;
                }

            }

            tk = getToken(l, lu);

            //Error Encountered 
            //r = re[ss[sp]];
            const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);
            
            if(RECOVERING > 0 && typeof(recovery_token) == "string"){
                RECOVERING = -1; // To prevent infinite recursion
                tk = recovery_token;
                //reset current token
                l.tl = 0;
                continue;
            }
        }

        st = r >> 2;

        switch(r & 3){
            case 0: // ERROR
                
                if(tk == "$")
                    l.throw("Unexpected end of input");

                l.throw(\`Unexpected token [\${RECOVERING ? l.next().tx : l.tx}]\`); 

                return [null];

            case 1: // ACCEPT
                break outer;

            case 2: //SHIFT
                o.push(l.tx); 
                ss.push(off, r >> 2); 
                sp+=2; 
                p.sync(l);
                l.next(); 
                off = l.off; 
                tk = getToken(l, lu); 
                RECOVERING++;
                break;

            case 3: // REDUCE

                len = (r & 0x3FC) >> 1;

                ss.length -= len;   
                sp -= len; 

                gt = goto[ss[sp]](r >> 10);

                if(gt < 0)
                    l.throw("Invalid state reached!");
                
                ss.push(off, gt); sp+=2; 
                break;
        }  
    }
    console.log(time)
    return o[0];
}`;
}
