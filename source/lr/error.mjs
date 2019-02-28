export function shiftCollisionCheck(grammar, state, new_state, item) {
    const bodies = grammar.bodies,
        body_a = bodies[item.body],
        k = body_a[item.offset],
        shift = state.action.get(k);

    if (shift && shift.state !== new_state.id) {
        const body_b = bodies[shift.body];

        console.error(`  \x1b[43m SHIFT \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);
        console.error(
            `   Shift action on symbol <${k}> for state <${state.id}> has already been defined.

    Existing Action: 
        Shift to state {${new_state.id}} from input { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action: 
        Shift to state {${shift.state}} from input { ${body_a.lex.slice().slice(1).trim()} }
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

        console.error(`  \x1b[42m GOTO \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);
        console.error(
            `   Goto action on symbol <${k}> for state <${state.id}> has already been defined.

    Existing Action: ${goto.fid}
        Goto to state {${goto.state}} from reduction of production { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action: ${item.full_id}
        Goto to state {${new_state.id}} from reduction of production { ${body_a.lex.slice().slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n`);

        return true;
    }
    return false;
}

export function reduceCollisionCheck(grammar, state, item) {

    const k = item.v,
        action = state.action.get(k);

    if (action && grammar[grammar.bodies[action.body].production].name !== state.b[0]) {
        const bodies = grammar.bodies,
            body_a = bodies[item.body],
            body_b = grammar.bodies[action.body];

        console.error(`  \x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m`);

        console.error(
            `   A reduction on symbol <${k}> for state <${state.id}> has already been defined. ${state.b.join(" ")}

    Existing Action:
        Reduce to {${grammar[body_b.production].name}} from production { ${body_b.lex.slice().slice(1).trim()} }
        Definition found on line ${body_b.lex.line+1}:${body_b.lex.char} in input.

    Replacing Action:
        Reduce to {${grammar[body_a.production].name}} from production { ${body_a.lex.slice().slice(1).trim()} }
        Definition found on line ${body_a.lex.line+1}:${body_a.lex.char} in input.\n\n`);

        return true;
    }

    return false;
}
