/** Compiles a stand alone JS parser from a LR rules table and env object **/
import whind from "../../node_modules/@candlefw/whind/source/whind.mjs";
import { getToken, types, FOLLOW } from "../common.mjs";

function setNode(node, length, functions, id, str = "") {   
    if (node.TYPE == "class") {
        str += `let ln = Math.max(o.length-${length},0); o[ln]=(new ${node.NAME}(o.slice(${-length}),e,l,s));o.length=ln+1;`;
    } else {
        str += `let ln = Math.max(o.length-${length},0); o[ln]=${node.NAME}(o.slice(${-length}),e,l,s);o.length=ln+1;`;
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
        goto_functions = [],
        state_str_functions = [],
        recovery_states = [],
        state_functions_map = new Map(),
        state_maps = [],
        state_maps_map = new Map(),
        goto_maps = new Map();


    //Construct all non existing follows for use with error recovery.
    FOLLOW(grammar, 0);

    let errors = [];
    let error_handlers = [];

    for (let i = 0; i < grammar.length; i++) {
        let production = grammar[i];
        let matches = new Set();
        let str = "";

        production.follow.forEach((v) => {
            matches.add(typeof(v) == "object" ? v.v : v);
        });

        if (matches.size > 0) {
            let j = 0;
            errors.push(`(v)=>([${(matches.forEach((v,i) => str+= (j++>0)? `,"${v}"` : `"${v}"`), str)}]).includes(v) ? 1 : 0`);
        } else
            errors.push(`(v)=>0`);
    }

    let functions = [];
    let fn_id = 0;
    let lu_id = 0;
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        let actions = [];
        let err = `eh[${i}](t,o,e,l,s)`;
        let production = grammar[bodies[state.body].production];

        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }

        let state_map = [];

        state.action.forEach((v, k, i) => {

            let str = ``;
            state_map.push(k);

            let length = v.size;
            let body = states.bodies[v.body];
            let st_fn_id = "";
            let funct = "";
            let return_value = -1;
            let fn = 0;
            switch (v.name) {
                case "REDUCE":
                    st_fn_id = "r";

                    if (body.node && length > 0) {
                        const out = setNode(body.node, length, functions, fn_id, "");
                        str = out.str;
                        funct = out.str;
                        st_fn_id += body.node.NAME;
                        fn_id = out.id;
                    }else if(length == 0)
                        funct = "o.push(null)"; // empty production
                    
                    if (body.sr[v.len]) 
                        str += `${body.sr[v.len].name}(o,e,l,s);`;

                    return_value = (3 | (length << 2) | (v.production << 10));

                    st_fn_id += return_value;

                    fn = state_functions_map.get(st_fn_id);

                    if (!fn) {
                        fn = state_str_functions.push(`(t, e, o, l, s)=>${ funct ? "{"+funct+"; return "+return_value+"}": ""+return_value}`);
                        state_functions_map.set(st_fn_id, fn);
                    }

                    state_map.push(`${fn}`);
                    break;
                case "SHIFT":
                    st_fn_id = "s";

                    if (body.sr[v.len]) {
                        let name = body.sr[v.len].name;
                        if (body.sr[v.len].name == "anonymous") {
                            name = `f${body.id}_${v.len}`;
                            if (!env.functions[name])
                                env.functions[name] = body.sr[v.len];
                        }
                        st_fn_id += name;
                        funct = `${name}(o,e,l,s)`;
                        str += `${name}(o,e,l,s);`;
                    }

                    return_value = (2 | (v.state << 2));

                    st_fn_id += return_value;

                    fn = state_functions_map.get(st_fn_id);

                    if (!fn) {
                        fn = state_str_functions.push(`(t, e, o, l, s)=>${ funct ? "{"+funct+"; return "+return_value+")": ""+return_value}`);
                        state_functions_map.set(st_fn_id, fn);
                    }

                    state_map.push(`${fn}`);

                    break;
                case "ACCEPT":
                    st_fn_id = "a"

                    if (body.node) {
                        const out = setNode(body.node, length, functions, fn_id, str);
                        str = out.str;
                        funct = out.str;
                        st_fn_id += fn_id;
                        fn_id = out.id;
                    }

                    if (body.sr[v.len])
                        str += `${body.sr[v.len].name}(o,e,l,s);`;

                    return_value = 1 | (length << 2);

                    st_fn_id += return_value;

                    fn = state_functions_map.get(st_fn_id);

                    if (!fn) {
                        fn = state_str_functions.push(`(t, e, o, l, s)=>${ funct ? "{"+funct+"; return "+return_value+"}": ""+return_value}`);
                        state_functions_map.set(st_fn_id, fn);
                    }

                    state_map.push(`${fn}`);

                    break;
            }

            actions.push(str);
        });


        //Create the goto tables. Find matches and consolidate.
        //Goto tables are found at top of the parser.
        let goto = [];
        let temp = [];
        let v = 0;

        state.goto.forEach((v, k) => {
            //v is the state to goto
            //k is the production to match
            temp.push([k, v.state])
        });

        temp
            .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .forEach(k => {
                while (v < k[0]) {
                    goto.push(-1)
                    v++;
                }
                goto.push(k[1]);
                v++;
            })

        let id = -1;

        if (goto.length > 0) {

            let goto_id = goto.join("");


            if (goto_maps.has(goto_id)) {
                id = goto_maps.get(goto_id).id;
            } else {
                id = goto_maps.size;
                goto_maps.set(goto_id, { id, goto });
            }
        }

        goto_functions.push((goto.length > 0) ? `(v,r = gt${id}[v]) => (r >= 0 ? r : -1)` : `nf`);

        let sm_id = `new Map([${state_map.reduce((a, c, i)=> a + (i%2==0 ? `${i>0?",":""}["${c}"` : "," + c +  "]"), "" )}])`;
        let mm = state_maps_map.get(sm_id);
        if(mm == undefined){
            mm = state_maps.length;
            state_maps_map.set(sm_id, mm);
            state_maps.push(sm_id);
        }

        state_functions.push(`sm[${mm}]`);
        recovery_states.push(`${(state.body) << 2}`)

    }

    if (env.functions) {
        for (let n in env.functions) {
            let funct = env.functions[n];
            functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }
    }

    let temp_string = ""
    output += 
`const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(\`unexpected token \${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production \${s} \`))}, nf = ()=>-1, ${functions.length > 0 ? functions.join(",\n") +",": "" }
symbols = [${grammar.symbols.map(e=>`"${e}"`).join(",\n")}],
goto = [${goto_functions.join(",\n")}],
err = [${errors.join(",\n")}],
eh = [${error_handlers.join(",\n")}],
${(temp_string = "", goto_maps.forEach(v => {temp_string += `gt${v.id} = [${v.goto.join(",")}],\n`;}), temp_string)}
sf = [${state_str_functions.join(",\n")}],
rec = [${recovery_states.join(",\n")}],
sm = [${state_maps.join(",\n")}],
state = [${state_functions.join(",\n")}],
re = new Set([${[...grammar.reserved].map(e => `\"${e.trim()}\"`).join()}]),
throw_ = ()=>{debugger},
types = ${JSON.stringify(types)};

${getToken.toString()}

 function parser(l, e = {}){

    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s), console.log(s)});
        l.off = 0;
        l.tl = 0;
        l.next();
    }

    let tk = getToken(l, re), sp = 1, len = 0, off= 0;

    const o = [], ss = [0,0];
    let time = 10000;
    outer:
    while(time-- > 0){
        
        let fn = state[ss[sp]].get(tk) || 0, r, st = 0, gt = -1, c = 0;

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
        } else {
            //Error Encountered 
            r = re[ss[sp]];
            eh[ss[sp]](tk, e, o, l, ss[sp-1]);
        }

        st = r >> 2;

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
                o.push((tk[0] == "θ") ? l.tx : tk); ss.push(off, r >> 2); sp+=2; l.next(); off = l.off; tk = getToken(l, re); 
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
    return o[0];
}`;

    return output;
}
