import {
    ERROR,
    SHIFT,
    REDUCE,
    FORK,
    IGNORE
} from "../common/state_action_enums.js";

import {
    SET_NEW_ACTION,
    KEEP_EXISTING_ACTION,
    ACTION_COLLISION_ERROR
} from "../common/state_parse_action_enums.js";

export function shiftCollisionCheck(grammar, state, new_state, item, size, error) {
    const sym = item.sym.val,
        action = state.action.get(sym);
        
    if (action && action.state !== new_state.id) {
        if (action.name == IGNORE || action.name == ERROR)
            return KEEP_EXISTING_ACTION;
        
        if (action.name === FORK)
            return ACTION_COLLISION_ERROR;

        if (action.name !== SHIFT) {
            error.log(
                `\x1b[43m SHIFT/REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Reduce action on symbol <${sym}> has already been defined for state:
 <${state.id}> ${state.production_string} 
 
    Existing Action: 
         Reduce to {${action.item.body_.production.name}} from production ${action.item.renderWithProduction()}
         Definition found on line ${action.item.body_.lex.line+1}:${action.item.body_.lex.char} in input.

    Replacing Action: 
        Shift to state ${item.renderWithProduction()} from input { ${sym} }
        Definition found on line ${item.body_.lex.line+1}:${item.body_.lex.char} in input.

    Favoring Shift Action`);
            return ACTION_COLLISION_ERROR;
        } else {
            error.log(
                `\x1b[43m SHIFT \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Shift action on symbol <${sym}> has already been defined for state:
 <${state.id}> ${state.production_string} 

    Existing Action: 
        Shift to state ${action.item.renderWithProduction()} from input { ${sym} }
        Definition found on line ${action.item.body_.lex.line+1}:${action.item.body_.lex.char} in input.
        Production Path ${grammar.states[action.state].d}

    Replacing Action: 
        Shift to state ${item.renderWithProduction()} from input { ${sym} }
        Definition found on line ${item.body_.lex.line+1}:${item.body_.lex.char} in input.`);

            return ACTION_COLLISION_ERROR;
        }
    }
    return SET_NEW_ACTION;
}

export function reduceCollisionCheck(grammar, state, item, error) {

    const sym = item.v,
        action = state.action.get(sym);


    if (action) {

        if (action.name == IGNORE || action.name == ERROR)
            return KEEP_EXISTING_ACTION;

        if (action.name === FORK)
            return ACTION_COLLISION_ERROR;

        if (action.name !== REDUCE) {

            error.log(
                `\x1b[43m REDUCE/SHIFT  \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Reduce action on symbol <${sym}> has already been defined for state:
 <${state.id}> ${state.production_string}

        Existing Action: 
            Shift to state ${action.item.renderWithProduction()}  from input { ${sym} }
            Definition found on line ${action.item.body_.lex.line+1}:${action.item.body_.lex.char} in input.


        Replacing Action: 
            Reduce to {${item.body_.production.name}} from production ${item.renderWithProduction()}
            Definition found on line ${item.body_.lex.line+1}:${item.body_.lex.char} in input.
`);
            return ACTION_COLLISION_ERROR;
        }

        if (item.body_.production.name == state.production.name)
            return KEEP_EXISTING_ACTION;

        if (item.body_.production.name !== action.item.body_.production.name) {
            error.log(
                `\x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
                
 A reduction on symbol <${sym}> has already been defined for state:
 <${state.id}> ${state.production_string}

        Existing Action:
            Reduce to {${action.item.body_.production.name}} from production ${action.item.renderWithProduction()}
            Definition found on line ${action.item.body_.lex.line+1}:${action.item.body_.lex.char} in input.
            Graph ID: ${action.item.body_.production.graph_id}

        Replacing Action:
            Reduce to {${item.body_.production.name}} from production ${item.renderWithProduction()}
            Definition found on line ${item.body_.lex.line+1}:${item.body_.lex.char} in input.
            Graph ID: ${item.body_.production.graph_id}
            `);

            return ACTION_COLLISION_ERROR;
        }

    }
    return SET_NEW_ACTION;
}

export function gotoCollisionCheck(grammar, state, new_state, item, error) {



                

    const
        bodies = grammar.bodies,
        body_a = bodies[item.body],
        k = body_a[item.offset],
        goto = state.goto.get(k);

    if (goto && goto.state !== new_state.id) {

        const
            production = bodies[k].production.name,
            new_state_body = [bodies[new_state.body].production.name, "→", ...bodies[new_state.body]].map((d) => isNaN(d) ? d : grammar[d].name);

        error.log(
            `\x1b[42m GOTO \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Goto on production {${production}} has already been defined for state: 
 <${state.id}> ${state.production_string}

    Existing Action: 
        Goto to state ${grammar.states[goto.state].b} ${goto.state} from reduction of production ${goto.item.renderWithProduction()}
        Definition found on line ${goto.body_.lex.line+1}:${goto.body_.lex.char} in input.

    Replacing Action:
        Goto to state ${new_state_body.join(" ")} ${new_state.id} from reduction of production ${item.renderWithProduction()}
        Definition found on line ${item.body_.lex.line+1}:${item.body_.lex.char} in input.\n\n

    Keeping Existing Action Goto to state {${grammar.states[goto.state].b}} ${goto.state}
`);
        return KEEP_EXISTING_ACTION;
    }
    return SET_NEW_ACTION;
}