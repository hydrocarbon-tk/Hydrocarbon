import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import { renderCompressed } from "@candlefw/js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    const mt_runner = new HybridMultiThreadRunner(grammar, env);

    for (const updates of mt_runner.run()) {
        // console.log(0, 3, updates);
        await spark.sleep(10);
    }
    fs.writeFileSync(`./hybrid_${new URL(grammar.uri).filename}.js`, "export default " + mt_runner.parser);

    return Function(`return (${mt_runner.parser})()`)();
    /*

    

    //get lr states and ll productions
    const
        runner = constructCompilerRunner(false),
        ll_fns = GetLLHybridFunctions(grammar, env, runner),
        rl_states = CompileHybridLRStates(grammar, env, runner),
        hybrid_lr_states = [],
        fns = [];

    let ids = [];

    for (const fn of ll_fns) {

        if (fn.L_RECURSION) {
            //Integrate function into states and get the entry state ID. 
            const
                state = IntegrateState(grammar[fn.id], rl_states, grammar, env, runner, "$" + grammar[fn.id].name);

            //fn.fn = renderState(state, rl_states, grammar, updateStateIDLU(rl_states, ids), ll_fns, true);
            //fn.fn.nodes[0].value = "$" + grammar[fn.id].name;

            state.name = "$" + grammar[fn.id].name;

            hybrid_lr_states.push(state);

            continue;
        }

        fns.push(fn.fn);
    }

    // /return _=>_;


    fns.push(...renderStates(hybrid_lr_states, rl_states, grammar, runner, undefined, ll_fns, true));

    runner.update_nodes();
    runner.update_constants();

    const parser = `(b)=>{
const pos = null;
${
        runner.ANNOTATED ? `function log(...str) {
            console.log(...str);
        }\nfunction glp(lex, padding = 4){
            const token_length = lex.tl;
            const offset = lex.off;
            const string_length = lex.sl;
            const start = Math.max(0, offset - padding);
            const mid = offset;
            const end = Math.min(string_length, offset + token_length  + padding);
            return \`\${(start > 0 ?" ": "")+lex.str.slice(start, mid) + "•" + lex.str.slice(mid, end) + ((end == string_length) ? "$EOF" : " ")}\`;
        }\n`: ""
        }
function lm(lex, syms) { 
    for (const sym of syms) 
        switch (typeof sym) {
            case "number":
                if (sym == 0xFF && lex.END) return true;  
                if (lex.ty == sym) return true; 
                break;
            case "string":
                if (lex.tx == sym) return true
                break;
        }
    return false;
}

function fail(lex, e) { 
    e.FAILED = true;
    e.error.push(lex.copy());
}

function _s(s, lex, e, eh, skips, ...syms) {
    
    if(e.FAILED) return "";
    
    var val = lex.tx;
   
    if (syms.length == 0 || lm(lex, syms)) {
   
        lex.next();
   
        if (skips) while (lm(lex, skips)) lex.next();
   
        e.sp++;

        s.push(val);
        
    } else {
   
        //error recovery
        const tx = eh(lex, e);

   
        if(!tx){
            e.FAILED = true;
            e.error.push(lex.copy());
        }
    }

    return s;
}


function _(lex, e, eh, skips, ...syms) {
    
    if(e.FAILED) return "";
    
    var val = lex.tx;
   
    if (syms.length == 0 || lm(lex, syms)) {
   
        lex.next();
   
        if (skips) while (lm(lex, skips)) lex.next();
   
        return val;
    } else {
   
        //error recovery
        const tx = eh(lex, e);
   
        if(tx) return tx;
   
        else {
            e.FAILED = true;
            e.error.push(lex.copy());
        }
    }
}

const skips = [8, 256];

${ runner.render_constants()}

${ runner.render_functions()}

${ fns.map(fn => {
            const id = fn.nodes[0].value;
            const member = exp(`({${id}:null})`).nodes[0].nodes[0];
            member.nodes[1] = fn;
            return fn;
        }).map(fn => renderWithFormatting(fn)).join("\n")}


return Object.assign( function (lexer, env = {
    error: [],
    eh: (lex, e) => { },
    sp:0,
    asi: (lex, env, s) => { }
}) {
    
    env.FAILED = false;
    const states = [];
    lexer.IWS = false;
    lexer.PARSE_STRING = true;
    ${grammar?.meta?.symbols?.size > 0 ? `lexer.addSymbols(${[...grammar.meta.symbols.values()].map(translateSymbolValue).join(",")});` : ""}
    lexer.tl = 0;

    env.fn =  {
        parseString(lex, env, symbols, LR){
            const copy = lex.copy();
            while(lex.tx != '"' && !lex.END){
                if(lex.tx == "\\\\") lex.next();
                lex.next();
            } 
            symbols[LR ? symbols.length-1 : 0] = lex.slice(copy)
        }
    }
    _(lexer, env, env.eh,skips)
    const result = $${ grammar[0].name}(lexer, env);
    
    if (!lexer.END || (env.FAILED )) {

            const error_lex = env.error.concat(lexer).sort((a,b)=>a.off-b.off).pop();
            error_lex.throw(\`Unexpected token [\${error_lex.tx}]\`);
        
    }
    return result;
}, {${ fns.map(fn => {
            const id = fn.nodes[0].value;
            const member = exp(`({${id}:null})`).nodes[0].nodes[0];
            member.nodes[1] = fn;
            //fn.nodes[2].nodes.splice(0, 0, stmt(`console.log(\`[\${lex.tx}] -> ${id}\`)`));
            return id;
        }).join(",\n")}})
}`;

    fs.writeFileSync(`./hybrid_${new URL(grammar.uri).filename}.js`, "export default " + parser);

    return Function(`return (${parser})`)();
};

export { GetLLHybridFunctions as CompileLLHybrid };
function updateStateIDLU(rl_states: States, ids: any[]): JSNode[][] {
    return rl_states.states.reduce((r, a, i) => (r[i] ? null : (r[i] = []), r), ids);
    */
}

