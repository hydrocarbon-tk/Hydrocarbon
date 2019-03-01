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

        console.error(`  \x1b[42m GOTO \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);
        console.log(grammar.states.length, goto.state, grammar.states[goto.state])
        console.error(
            `   Goto action on symbol <${k}> for state <${state.id}> <${state.b.join(" ")}> has already been defined.

    Existing Action: 
        Goto to state {${grammar.states[goto.state].b.join(" ")}} ${goto.state} from reduction of production { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action:
        Goto to state {${new_state.b.join(" ")}} ${new_state.id} from reduction of production { ${body_a.lex.slice().slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n`);

        return true;
    }
    return false;
}

export function reduceCollisionCheck(grammar, state, item) {
    
    const k = item.v,
        action = state.action.get(k);
        

    if (action){
        const  bodies = grammar.bodies,
            body_a = bodies[item.body],
            body_b = grammar.bodies[action.body]; 

        if(grammar[body_b.production].name == state.b[0]) // TODO: Already reducing to the expected production )
            return 1;
        ; // intentional

        if(
            /*//*/ grammar[body_a.production].name !== state.b[0]
            && body_b.production !== body_a.production // Reduction to same production should not be any error
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
