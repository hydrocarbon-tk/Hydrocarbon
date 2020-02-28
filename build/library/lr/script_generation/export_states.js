export function ExportStates(states) {
    return states.slice().map((s, i) => JSON.stringify({ name: i, body: s.body, b: s.b, gt: [...s.goto.entries()], act: [...s.action.entries()] })).join("\n");
}
export function ImportStates(states_string) {
    const states = (states_string.split(/\n/g).map(JSON.parse).map(e => {
        return {
            symbol_type: e.symbol_type,
            id: e.name,
            body: e.body,
            b: e.b,
            goto: new Map(e.gt),
            action: new Map(e.act)
        };
    }));
    states.type = "lr";
    return states;
}
