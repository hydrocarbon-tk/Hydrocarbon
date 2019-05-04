/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { getToken, types, FOLLOW } from "../common.mjs";

function setNode(node, length, functions, id, str = "", COMPILE_FUNCTION = true) {

    const prefix = (node.TYPE == "class") ? "new" : "";

    const funct = (!COMPILE_FUNCTION && node.ENV) ?
        `o[ln]=(${prefix} e.functions.${node.NAME}(o.slice(${-length}),e,l,s))` :
        `o[ln]=(${prefix} ${node.NAME}(o.slice(${-length}),e,l,s))`;

    str += `let ln = Math.max(o.length-${length},0); ${funct};o.length=ln+1;`;

    return { str, id };
}

export function LRParserCompiler(rule_table, env) {
    //Build new env variables if they are missing 

    let output = "";
    if (rule_table.type !== "lr") throw new Error("");

    const
        states = rule_table,
        grammar = rule_table.grammar,
        bodies = rule_table.bodies,
        state_functions = [],
        goto_functions = [],
        state_str_functions = [],
        recovery_states = [],
        state_functions_map = new Map(),
        state_maps = [],
        state_maps_map = new Map(),
        goto_maps = new Map(),
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : !0,
        functions = [],
        errors = [],
        error_handlers = [];

    let fn_id = 0;

    //Construct all non existing follows for use with error recovery.
    FOLLOW(grammar, 0);

    for (let i = 0; i < grammar.length; i++) {
        let str = "";

        const production = grammar[i],
            matches = new Set();

        production.follow.forEach((v) => {
            matches.add(typeof(v) == "object" ? v.v : v);
        });

        if (matches.size > 0) {
            let j = 0;
            errors.push(`(v)=>([${(matches.forEach(v => str+= (j++>0)? `,"${v}"` : `"${v}"`), str)}]).includes(v) ? 1 : 0`);
        } else
            errors.push(`(v)=>0`);
    }

    for (let i = 0; i < states.length; i++) {
        const
            state = states[i],
            actions = [],
            production = grammar[bodies[state.body].production];

        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }

        const state_map = [];

        state.action.forEach((v, k) => {

            state_map.push(k);

            const
                length = v.size,
                body = states.bodies[v.body];

            let
                str = ``,
                st_fn_id = "",
                funct = "",
                return_value = 0,
                fn = 0;

            switch (v.name) {

                case "REDUCE":

                    st_fn_id = "r";

                    if (body.node && length > 0) {
                        const out = setNode(body.node, length, functions, fn_id, "", COMPILE_FUNCTION);
                        str = out.str;
                        funct = out.str;
                        st_fn_id += body.node.NAME;
                        fn_id = out.id;
                    } else if (length == 0)
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

                case "IGNORE":
                    state_map.push(`0xFFFFFFFF`);
                    break;

                case "ERROR":
                    state_map.push(`0`);
                    break;

                case "SHIFT":
                    st_fn_id = "s";

                    if (body.sr[v.len]) {
                        let name = body.sr[v.len].name;
                        if (body.sr[v.len].name == "anonymous") {
                            name = `f${body.id}_${v.len}`;

                            if (!env.functions[name]) {
                                env.functions[name] = body.sr[v.len];
                                env.functions[name].INCORPORATE = true;
                            }
                        }
                        st_fn_id += name;
                        funct = `${name}(o,e,l,s)`;
                        str += `${name}(o,e,l,s);`;
                    }

                    return_value = (2 | (v.state << 2));

                    st_fn_id += return_value;

                    fn = state_functions_map.get(st_fn_id);

                    if (!fn) {
                        fn = state_str_functions.push(`(t, e, o, l, s)=>${ funct ? "{"+funct+"; return "+return_value+"}": ""+return_value}`);
                        state_functions_map.set(st_fn_id, fn);
                    }

                    state_map.push(`${fn}`);

                    break;
                case "ACCEPT":
                    st_fn_id = "a";

                    if (body.node) {
                        const out = setNode(body.node, length, functions, fn_id, str, COMPILE_FUNCTION);
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
            temp.push([k, v.state]);
        });

        temp
            .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .forEach(k => {
                while (v < k[0]) {
                    goto.push(-1);
                    v++;
                }
                goto.push(k[1]);
                v++;
            });

        let id = -1;

        if (goto.length > 0) {

            const goto_id = goto.join("");


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
        if (mm == undefined) {
            mm = state_maps.length;
            state_maps_map.set(sm_id, mm);
            state_maps.push(sm_id);
        }
        state_functions.push(`sm[${mm}]`);
        recovery_states.push(`${(state.body) << 2}`);

    }

    if (env.functions) {
        for (let n in env.functions) {
            const funct = env.functions[n];
            if (COMPILE_FUNCTION || !funct.ENV)
                functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }
    }

    let default_error = `(tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(\`unexpected token \${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production \${s} \`))}`;

    if (env.functions.defaultError)
        default_error = env.functions.defaultError.toString().replace(/(anonymous)?[\n\t]*/g, "");

    let temp_string = "";

    output +=
        `const e = ${default_error}, nf = ()=>-1, ${functions.length > 0 ? functions.join(",\n") +",": "" }
symbols = [${grammar.symbols.map(e=>`"${e}"`).join(",\n")}],
goto = [${goto_functions.join(",\n")}],
err = [${errors.join(",\n")}],
eh = [${error_handlers.join(",\n")}],
${(temp_string = "", goto_maps.forEach(v => {temp_string += `gt${v.id} = [${v.goto.join(",")}],\n`}), temp_string)}
sf = [${state_str_functions.join(",\n")}],
rec = [${recovery_states.join(",\n")}],
sm = [${state_maps.join(",\n")}],
state = [${state_functions.join(",\n")}],
re = new Set([${[...grammar.reserved].map(e => `"${e.trim()}"`).join()}]),
throw_ = ()=>{debugger},
types = ${JSON.stringify(types)};

${getToken.toString()}

 function parser(l, e = {}){
    l.IWS = false;

    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s)});
        l.off = 0;
        l.tl = 0;
        l.next();
    }

    const o = [], ss = [0,0];
    
    let time = 10000, RECOVERING = false,
        tk = getToken(l, re), p = l.copy(), sp = 1, len = 0, off= 0;
    
    outer:

    while(time-- > 0){
        
        let fn = state[ss[sp]].get(tk) || 0, r, st = 0, gt = -1, c = 0;

        if(fn == 0xFFFFFFFF){
            //Ignore the token
            l.next();
            tk = getToken(l, re, state[ss[sp]]);
            continue;
        }

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
        } else {
            //Error Encountered 
            r = re[ss[sp]];
            
            const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);
            
            if(!RECOVERING && typeof(recovery_token) == "string"){
                RECOVERING = true; // To prevent infinite recursion
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
                o.push((tk[0] == "θ") ? l.tx : tk); 
                ss.push(off, r >> 2); 
                sp+=2; 
                p.sync(l);
                l.next(); 
                off = l.off; 
                tk = getToken(l, re, state[ss[sp]]); 
                
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

        RECOVERING = false;
    }
    return o[0];
}`;

    return output;
}
