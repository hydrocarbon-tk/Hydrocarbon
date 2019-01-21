/** Compiles a stand alone JS parser from a LR rules table and env object **/
import whind from "../../node_modules/@candlefw/whind/source/whind.mjs";
import { getToken, types, FOLLOW } from "../common.mjs";

function setNode(node, length, functions, id, str = "") {
    if (node.TYPE == "class") {
        str += `o[o.length-${length}]=(new ${node.NAME}(o.slice(${-length}),e,l,s));o.length-=${length-1};`;
    } else {
        str += `o[o.length-${length}]=${node.NAME}(o.slice(${-length}),e,l,s);o.length-=${length-1};`;
    }
    return { str, id };
}

export function LRParserCompiler(rule_table, env) {
    //Build new env variables if they are missing 

    let output = "";
    if (rule_table.type !== "lr") throw new Error("");

    const states = rule_table,
        grammar = rule_table.grammar,
        bodies = rule_table.bodies,
        state_functions = [],
        state_lut = [],
        goto_functions = [];

    //Construct all non existing follows for use with error recovery.
    FOLLOW(grammar, 0);

    let errors = [];
    let error_handlers = [];

    for (let i = 0; i < grammar.length; i++) {
        let production = grammar[i];
        let matches = [];

        production.follow.forEach((v) => {
            matches.push(`case "${v}":`);
        });

        errors.push(`(v)=>{switch(v){${matches.join("")} return 1;} return 0;}`);
    }

    let functions = [];
    let fn_id = 0;
    let lu_id = 0;
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        let actions = [];
        let err = `eh[${i}](t,o,e,l,s);`;
        let production = grammar[bodies[state.body].production];

        if (production.error){
            const funct = production.error;
            error_handlers.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }else{
            error_handlers.push("deh")
        }

        state.action.forEach((v, k, i) => {
            let str = `case "${k}":`;
            let length = v.size;
            let body = states.bodies[v.body];

            switch (v.name) {
                case "REDUCE":

                    if (body.node) {
                        const out = setNode(body.node, length, functions, fn_id, str);
                        str = out.str;
                        fn_id = out.id;
                    }

                    if (body.sr[v.len])
                        str += `${body.sr[v.len].name}(o,e,l,s);`;

                    str += `r= ${ 3 | (length << 2) | (v.production << 10)};break;`;
                    break;
                case "SHIFT":
                    if (body.sr[v.len]) {
                        let name = body.sr[v.len].name;
                        if (body.sr[v.len].name == "anonymous") {
                            name = `f${body.id}_${v.len}`;
                            if (!env.functions[name])
                                env.functions[name] = body.sr[v.len];
                        }
                        str += `${name}(o,e,l,s);`;
                    }

                    str += `r= ${ 2 | (v.state << 2)};break;`;

                    break;
                case "ACCEPT":

                    if (body.node) {
                        const out = setNode(body.node, length, functions, fn_id, str);
                        str = out.str;
                        fn_id = out.id;
                    }

                    if (body.sr[v.len])
                        str += `${body.sr[v.len].name}(o,e,l,s);`;

                    str += `r= ${ 1 | (length << 2)};break;`;

                    break;
            }

            actions.push(str);
        });

        let goto = [];

        state.goto.forEach((v, k) => {
            goto.push(`case ${k}: return ${v};`);
        });

        goto_functions.push((goto.length > 0) ? `(v) => {switch(v){${goto.join("")}}; return -1;}` : `nf`);
        state_functions.push(`(t, e, o, l, s, r=0)=>{switch(t){${actions.join("")}default: r = ${(state.body) << 2}; ${err}} return r;}`);

    }

    if (env.functions) {
        for (let n in env.functions) {
            let funct = env.functions[n];
            functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }
    }

    output += `
    const deh = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(\`unexpected token \${tk} on production \${s} \`))}, nf = ()=>-1, ${functions.length > 0 ? functions.join(",\n") +",": "" }
    state   = [${state_functions.join(",\n")}],
    goto = [${goto_functions.join(",\n")}],
    err = [${errors.join(",\n")}],
    eh = [${error_handlers.join(",\n")}],
    re = new Set([${[...grammar.reserved].map(e => `\"${e.trim()}\"`).join()}]),
    throw_ = ()=>{debugger},
    types = ${JSON.stringify(types)};

    ${getToken.toString()}
    
     function parser(l, e = {}){
        let tk = getToken(l, re), sp = 1, len = 0, off= 0;
        const o = [], ss = [0,0];
        let time = 10000;
        outer:
        while(time-- > 0){
            
            let r = state[ss[sp]](tk, e, o, l, ss[sp-1]);
            let st = r >> 2;
            let gt = -1, c = 0;            
            switch(r & 3){
                case 0: // ERROR
                    console.log(\` Error on input \${tk} \`)
                    
                    if(tk == "$")
                        l.throw("Unexpected EOF");
                    
                    //pull up error routine for this production
                    const ALLOW_RECOVERY = (r>>2) & 0xFF;
                    
                    if(ALLOW_RECOVERY){
                        
                        while(sp > -1){
                            if((gt = goto[ss[sp]](st)) >= 0)
                                break;
                            sp-=2;
                            c++;
                        }

                        if(gt >= 0){
                            ss.length = sp+1;
                            ss.push(off, gt);
                            sp+=2;

                            //o.length -= c;

                            while(!err[st](tk) && !l.END){
                                tk = getToken(l.next(), re);
                            }
                        }
                        break;
                    }
                    l.throw("Unrecoverable error encountered here"); 
                    break;
                case 1: // ACCEPT
                    break outer;
                case 2: //SHIFT
                    o.push((tk[0] == "θ") ? l.tx : tk); ss.push(off, r >> 2); sp+=2; l.next(); off = l.off; tk = getToken(l, re); break;
                case 3: // REDUCE
                    len = (r & 0x3FC) >> 1;
                    ss.length -= len;   
                    sp -= len; 
                    gt = goto[ss[sp]](r >> 10);
                    if(gt < 0)
                        l.throw("Invalid state reached!");
                    ss.push(off, gt); sp+=2; break;
            }   
        }
        return o[0];
    }`;

    return output //==.replace(/[\n\t]/g,"");
}
