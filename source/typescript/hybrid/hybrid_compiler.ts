import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import fs from "fs";
import { GetLLHybridFunctions } from "./ll_hybrid.js";
import { renderWithFormatting, stmt, JSNodeType, JSNode } from "@candlefw/js";
import { CompileHybridLRStates, renderStates, renderState, IntegrateState, States, markReachable } from "./lr_hybrid.js";

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

    const rl_states = CompileHybridLRStates(grammar, env),
        fns = [];

    rl_states.states[0].refs++;

    fns.push(...renderStates(rl_states, grammar));

    const parser = `
function assertAndAdvance(lex, bool){
    const v = lex.tx;
    if(bool) lex.next();
    else lex.throw("Unexpected Token");
    return v;
}

${ fns.map(fn => renderWithFormatting(fn)).join("\n\n")};

return function(lexer){
    const states = [];
    return $${grammar[0].name}(lexer);

}`;

    fs.writeFileSync("./lr_hybrid.js", parser);

    return Function(parser)();
}

export function CompileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    // renderLRFN(grammar, env);
    //get lr states and ll productions
    const
        ll_fns = GetLLHybridFunctions(grammar, env),
        rl_states = CompileHybridLRStates(grammar, env),
        hybrid_lr_states = [],
        fns = [];

    let ids = [];

    for (const fn of ll_fns) {

        if (fn.L_RECURSION) {
            //Integrate function into states and get the entry state ID. 
            const
                state = IntegrateState(grammar[fn.id], rl_states, grammar, env);

            //fn.fn = renderState(state, rl_states, grammar, updateStateIDLU(rl_states, ids), ll_fns, true);
            //fn.fn.nodes[0].value = "$" + grammar[fn.id].name;

            state.name = "$" + grammar[fn.id].name;

            hybrid_lr_states.push(state);

            continue;
        }

        fns.push(fn.fn);
    }

    // /return _=>_;


    fns.push(...renderStates(hybrid_lr_states, rl_states, grammar, updateStateIDLU(rl_states, ids), ll_fns, true));

    const parser = `
function createPos(lex, off){
    const copy = lex.copy;
    copy.off = lex.next;
    copy.fence(lex);
    return copy;
}

function lm(lex, syms) {
    for (const sym of syms) {
        if (typeof sym == "number") {
            if (sym == 0xFF && lex.END) return true;
            else if (lex.ty == sym) return true;
        } else if (lex.tx == sym) return true;
    }
    return false;
}
    
function aaa(lex, e, skips, ...syms) {
    if (syms.length == 0 || lm(lex, syms)) {
        const val = lex.tx;
        lex.next();
        if (skips) while (lm(lex, skips)) lex.next();
        return val;
    } else {
        //error recovery
        const tx = handleError();
    }
}

${ fns.map(fn => renderWithFormatting(fn)).join("\n\n")};

return function(lexer){
    const states = [];
    lexer.IWS = false;
    const result =  $${grammar[0].name}(lexer);
    if(!lexer.END) lexer.throw(\`Unexpected token [\${lexer.tx}]\`);
    return result;
}`;

    fs.writeFileSync("./hybrid.js", parser);

    return Function(parser)();
}

export { GetLLHybridFunctions as CompileLLHybrid };

function updateStateIDLU(rl_states: States, ids: any[]): JSNode[][] {
    return rl_states.states.reduce((r, a, i) => (r[i] ? null : (r[i] = []), r), ids);
}

