import {Lexer} from "@candlefw/whind";

export function shiftCollisionCheck(grammar, state, new_state, item, size, error) {
    const bodies = grammar.bodies,
        body_a = bodies[item.body],
        k = body_a[item.offset],
        action = state.action.get(k),
        e_state = grammar.states;



    //console.log("ASADASDASD")
    if (action && action.state !== new_state.id) {


        const body_b = bodies[action.body];
        
        const v = new_state.b.slice();
        v.splice(size + 1, 0, ">");

        if (action.name !== "SHIFT") {
            error.log(
                `\x1b[43m SHIFT/REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
 Reduce action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.
    Existing Action: 
         Reduce to Terminal ${grammar[body_b.production].name} from production { ${Lexer.prototype.slice.call(body_b.lex).slice(1).trim()} }
         Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.
         Production Path ${grammar.states[action.state].d}

    Replacing Action: 
        Shift to state {${v.join(" ")}}  from input { ${k} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.
        Production Path ${new_state.d}\n

    Favoring Shift Action\n`);
            return 0;
        } else {

            const r = grammar.states[action.state].b.slice();
            
            r.splice(action.len + 1, 0, ">");

            error.log(
                `\x1b[43m SHIFT \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
 Shift action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.

    Existing Action: 
        Shift to state {${r.join(" ")}}  from input { ${k} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.
        Production Path ${grammar.states[action.state].d}

    Replacing Action: 
        Shift to state {${v.join(" ")}}  from input { ${k} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.
        Production Path ${new_state.d}\n\n`);


            return -1;
        }
    }
    return 0;
}


export function gotoCollisionCheck(grammar, state, new_state, item, error) {

    const bodies = grammar.bodies,
        body_a = bodies[item.body],
        k = body_a[item.offset],
        goto = state.goto.get(k);

    if (goto && goto.state !== new_state.id) {
        const body_b = bodies[goto.body];

        if (!grammar.states[goto.state].b) {
            const bodies = grammar.bodies;
            grammar.states[goto.state].b = [grammar[bodies[goto.body].production].name, "→", ...bodies[goto.body]].map((d) => isNaN(d) ? d : grammar[d].name);
        }

        let old_id = grammar.states[goto.state].real_id;
        let new_id = new_state.real_id;

        //  console.log("MAM",grammar.states[goto.state], new_state, goto.state)
        /*
        if (new_id.length <= old_id.length && old_id.includes(new_id)) {
            //console.log(new_state.real_id, grammar.states[goto.state].real_id)
            return 0;
        } else if (old_id.length <= new_id.length && new_id.includes(old_id)) {
           // console.log(new_state.real_id, grammar.states[goto.state].real_id)
            return 1;
        }
        */

        //let state_body = grammar.states[goto.state].b.join(" ");
        //console.log(k, old_id, grammar.states[goto.state].b)
        //*
        let production = grammar[grammar.bodies[k].production].name
        let new_state_body = [grammar[bodies[new_state.body].production].name, "→", ...bodies[new_state.body]].map((d) => isNaN(d) ? d : grammar[d].name)
        error.log(
            `\x1b[42m GOTO \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
 Goto on production {${production}} for state <${state.id}> <${state.b.join(" ")}> has already been defined.

    Existing Action: 
        Goto to state {${grammar.states[goto.state].b.join(" ")}} ${goto.state} from reduction of production { ${Lexer.prototype.slice.call(body_b.lex).slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action:
        Goto to state {${new_state_body.join(" ")}} ${new_state.id} from reduction of production { ${Lexer.prototype.slice.call(body_a.lex).slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n

    Keeping Existing Action Goto to state {${grammar.states[goto.state].b.join(" ")}} ${goto.state}
`);
        //*/


        return 0;
    }
    return 1;
}

export function reduceCollisionCheck(grammar, state, item, error) {

    const k = item.v,
        action = state.action.get(k);


    if (action) {

        const bodies = grammar.bodies,
            body_a = bodies[item.body],
            body_b = grammar.bodies[action.body];

        if (action.name !== "REDUCE") {

            const body_b = bodies[action.body];
            const v = grammar.states[action.state].b.slice();
            v.splice(action.len + 1, 0, ">");
            error.log(
`\x1b[43m REDUCE/SHIFT  \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Reduce action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.
        Existing Action: 
            Shift to state {${v.join(" ")}}  from input { ${k} }
            Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.\n\n
            Production Path ${grammar.states[action.state].d}

        Replacing Action: 
             Reduce to {${grammar[body_a.production].name}} from production { ${Lexer.prototype.slice.call(body_a.lex).slice(1).trim()} }
             Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.
             Production Path ${state.d}

        Favoring Shift Action \n`);
            return 1;
        }

        if (grammar[body_b.production].name == state.b[0]) // TODO: Already reducing to the expected production )
        {
            //console.log("TODO: Duplicate reduce merge", state.b[0], grammar[body_b.production].name)
            return 1;
        }

        if (
            //true || /*//*/
            grammar[body_a.production].name !== state.b[0] &&
            body_b.production !== body_a.production // Reduction to same production should not be an error
        ) {

            error.log(
                `\x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
 A reduction on symbol <${k}> for state <${state.id}> has already been defined. ${state.b.join(" ")}

        Existing Action:
            Reduce to {${grammar[body_b.production].name}} from production { ${body_b.lex.slice().slice(1).trim()} }
            Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.
            Production Path ${grammar.states[action.state].d}

        Replacing Action:
            Reduce to {${grammar[body_a.production].name}} from production { ${body_a.lex.slice().slice(1).trim()} }
            Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.
            Production Path ${state.d}\n\n`);

            return -1;
        }

    }
    return 0;
}
