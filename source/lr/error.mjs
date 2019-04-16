export function shiftCollisionCheck(grammar, state, new_state, item) {
    const bodies = grammar.bodies,
        body_a = bodies[item.body],
        k = body_a[item.offset],
        shift = state.action.get(k);

    if (shift && shift.state !== new_state.id) {
        const body_b = bodies[shift.body];

        console.error(`  \x1b[43m SHIFT \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);
        console.error(
            `   Shift action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.


    Existing Action: 
        Shift to state {${grammar.states[new_state.id].b}} from input { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action: 
        Shift to state {${grammar.states[shift.state].b}} from input { ${body_a.lex.slice().slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n`);

        return true;
    }
    return false;
}


export function gotoCollisionCheck(grammar, state, new_state, item) {
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

        console.log("MAM",grammar.states[goto.state], new_state, goto.state)

        if(new_id.length <=  old_id.length && old_id.includes(new_id)){
            //console.log(new_state.real_id, grammar.states[goto.state].real_id)
            return -1;
        }else if(old_id.length <= new_id.length && new_id.includes(old_id)){
            //console.log(new_state.real_id, grammar.states[goto.state].real_id)
            return 1;
        }

        let state_body = grammar.states[goto.state].b.join(" ")

        console.log(new_id, old_id)
        console.log(state)
        console.error(`  \x1b[42m GOTO \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);
        console.error(
            `   Goto action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.

    Existing Action: 
        Goto to state {${grammar.states[goto.state].b.join(" ")}} ${goto.state} from reduction of production { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action:
        Goto to state {${grammar.states[new_state.body].b.join(" ")}} ${new_state.id} from reduction of production { ${body_a.lex.slice().slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n

    Keeping Existing Action Goto to state {${grammar.states[goto.state].b.join(" ")}} ${goto.state}
`);



        return -1;
    }
    return 1;
}

export function reduceCollisionCheck(grammar, state, item) {
    
    const k = item.v,
        action = state.action.get(k);
        

    if (action){
        const  bodies = grammar.bodies,
            body_a = bodies[item.body],
            body_b = grammar.bodies[action.body]; 

        if(grammar[body_b.production].name == state.b[0]) // TODO: Already reducing to the expected production )
        {
            //console.log("TODO: Duplicate reduce merge", state.b[0], grammar[body_b.production].name)
            return 1;
        }

        if(
            /*//*/ grammar[body_a.production].name !== state.b[0]
            && body_b.production !== body_a.production // Reduction to same production should not be an error
        ) {


            console.error(`  \x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);

            console.error(
                `   A reduction on symbol <${k}> for state <${state.id}> has already been defined. ${state.b.join(" ")}

        Existing Action:
            Reduce to {${grammar[body_b.production].name}} from production { ${body_b.lex.slice().slice(1).trim()} }
            Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

        Replacing Action:
            Reduce to {${grammar[body_a.production].name}} from production { ${body_a.lex.slice().slice(1).trim()} }
            Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n`);

            return -1;
        }

    }
    return 0;
}
