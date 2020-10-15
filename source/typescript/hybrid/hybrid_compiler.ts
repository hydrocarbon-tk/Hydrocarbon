import fs from "fs";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { GetLLHybridFunctions } from "./ll_hybrid.js";
import { renderWithFormatting, JSNode, renderCompressed, JSNodeType, stmt } from "@candlefw/js";
import { CompileHybridLRStates, renderStates, IntegrateState, States } from "./lr_hybrid.js";
import { traverse } from "@candlefw/conflagrate";
import { Lexer } from "@candlefw/wind";
import { State } from "./State.js";
import { translateSymbolValue } from "./utilities.js";

export function renderLLFN(grammar: Grammar, env: GrammarParserEnvironment) {

    const parser = `

    function assertAndAdvance(lex, bool){
        const v = lex.tx;
        if(bool) lex.next();
        else lex.throw("Unexpected Token");
        return v;
    }

    ${GetLLHybridFunctions(grammar, env).map(a => renderWithFormatting(a.fn)).join("\n")};

    return function(lexer){
        const states = [];
        return $${grammar[0].name}(lexer);

    }`;

    fs.writeFileSync("./ll_hybrid.js", parser);

    return Function(parser)();;
}

export function renderLRFN(grammar: Grammar, env: GrammarParserEnvironment) {

    const
        rl_states = CompileHybridLRStates(grammar, env),
        state = IntegrateState(grammar[0], rl_states, grammar, env),
        fns = [];

    state.name = "$start";

    fns.push(...renderStates([state], rl_states, grammar));

    const parser = `
function assertAndAdvance(lex, bool){
    const v = lex.tx;
    if(bool) lex.next();
    else lex.throw("Unexpected Token");
    return v;
}

${ fns.map(fn => renderWithFormatting(fn)).join("\n\n")};

return function(lexer, env = {
    eh: (lex, e)=>{},
    asi: (lex, env, s) => {}
}){
    const states = [];
    lexer.IWS = false;
    const result =  $start(lexer, env);
    if(!lexer.END) lexer.throw(\`Unexpected token [\${lexer.tx}]\`);
    return result;
}`;

    fs.writeFileSync("./lr_hybrid.js", parser);

    return Function(parser)();
}

export function CompileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    //get lr states and ll productions
    const
        runner = {
            function_map: new Map,
            add_script: (body: JSNode[], fn: JSNode, call_append: string = "", state: State): JSNode => {
                if (body.length == 0) return [];

                const
                    node: JSNode = {
                        type: JSNodeType.Module,
                        nodes: body,
                        pos: Lexer
                    }, id = renderCompressed(node);


                if (!runner.function_map.has(id)) {
                    fn.nodes[2].nodes.unshift(...body);

                    const name = "$_" + runner.function_map.size,
                        arg_id = [...traverse(fn.nodes[1] || null, "nodes").filter("type", JSNodeType.IdentifierBinding)].map(s => s.node.value);

                    fn.nodes[0] = {
                        type: JSNodeType.Identifier,
                        value: name,
                    };

                    runner.function_map.set(id, {
                        name,
                        call_append,
                        arg_id,
                        fn,
                        body,
                        nodes: [node],
                        states: [state]
                    });
                } else {
                    runner.function_map.get(id).nodes.push(node);
                    runner.function_map.get(id).states.push(state);
                }

                return [node];
            },
            update_nodes: () => {
                for (const fn of runner.function_map.values()) {
                    if (fn.nodes.length > 1) {
                        // Move 
                        const call = stmt(`${fn.call_append}${fn.name}(${fn.arg_id.join(",")})`);
                        //convert each node to a call
                        for (const node of fn.nodes)
                            Object.assign(node, call);
                    }
                }
            },
            render_functions: () => {
                return [...runner.function_map.values()]
                    .filter(e => e.nodes.length > 1)
                    .filter(e => e.states.length > 1)
                    .filter(e => e.states.reduce((a, s) => s.REACHABLE || a, false))
                    .map(e => renderWithFormatting(e.fn)).join("\n\n");
            }
        },
        ll_fns = GetLLHybridFunctions(grammar, env, runner),
        rl_states = CompileHybridLRStates(grammar, env, runner),
        hybrid_lr_states = [],
        fns = [];

    let ids = [];

    for (const fn of ll_fns) {

        if (fn.L_RECURSION) {
            //Integrate function into states and get the entry state ID. 
            const
                state = IntegrateState(grammar[fn.id], rl_states, grammar, env, runner);

            //fn.fn = renderState(state, rl_states, grammar, updateStateIDLU(rl_states, ids), ll_fns, true);
            //fn.fn.nodes[0].value = "$" + grammar[fn.id].name;

            state.name = "$" + grammar[fn.id].name;

            hybrid_lr_states.push(state);

            continue;
        }

        fns.push(fn.fn);
    }

    // /return _=>_;


    fns.push(...renderStates(hybrid_lr_states, rl_states, grammar, runner, updateStateIDLU(rl_states, ids), ll_fns, true));

    runner.update_nodes();

    const parser = `
function createPos(lex, off){
    const copy = lex.copy;
    copy.off = lex.next;
    copy.fence(lex);
    return copy;
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


function lm_ty(lex, syms) {for (const sym of syms)  if (sym == 0xFF && lex.END) return true;  else if (lex.ty == sym) return true; return false;}

function lm_tx(lex, syms) {  for (const sym of syms) if (lex.tx == sym) return true; return false; }
    
function _(lex, e, eh, skips, ...syms) {
    if (syms.length == 0 || lm(lex, syms)) {
        const val = lex.tx;
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
        //else lex.throw(\`Could not parse unexpected token \${lex.END ? "EOI" : lex.tx }\`);
}
}

${ runner.render_functions()}

const skips = [8, 256];

${ fns.map(fn => {
        const id = fn.nodes[0].value;
        //fn.nodes[2].nodes.splice(0, 0, stmt(`console.log(\`[\${lex.tx}] -> ${id}\`)`));
        return fn;
    }).map(fn => renderWithFormatting(fn)).join("\n\n")};

return function (lexer, env = {
    error: [],
    eh: (lex, e) => { },
    asi: (lex, env, s) => { }
}) {
    env.FAILED = false;
    const states = [];
    lexer.IWS = false;
    lexer.addSymbols(${[...grammar.meta.symbols.values()].map(translateSymbolValue).join(",")})
    lexer.tl = 0;

    env.fn =  {
        ASI_PRE:(lex, env, eh, sym)=>{
            if(!env.FAILED){
                if(lex.tx != ";"){
                    const cp = lex.copy();
                    cp.IWS = false;
                    env.ASI_PRIMED = true;
                }
            }
        },
        ASI_POST:(lex, env, eh, sym)=>{
            if(env.ASI_PRIMED)
                env.FAILED =false;
            env.ASI_PRIMED = false;
        }
    }
    _(lexer, env, env.eh,skips)
    const result = $${ grammar[0].name}(lexer, env);
    
    if (!lexer.END || env.FAILED) {
        console.log(env.error.map(e=>e.errorMessage()));
        const error_lex = env.error.pop();
        error_lex.throw(\`Unexpected token [\${error_lex.tx}]\`);
    }
    return result;
}`;

    fs.writeFileSync("./hybrid.js", parser);

    return Function(parser)();
};

export { GetLLHybridFunctions as CompileLLHybrid };

function updateStateIDLU(rl_states: States, ids: any[]): JSNode[][] {
    return rl_states.states.reduce((r, a, i) => (r[i] ? null : (r[i] = []), r), ids);
}

