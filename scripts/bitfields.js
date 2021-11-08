import render from "bit-field/lib/render.js";
import onml from "onml";

const data = [{
    label: "Pointer", description:
        `Every state is represented by a series of bytecode instructions stored in 
the instruction buffer. A pointer is used to locate the head of a state's 
instruction sequence. When parsing, an entry pointer is passed as an argument
to the recognizer to start the parsing at a suitable entry state.`, render: [
        [{ bits: 20, name: "Instruction Header Index" },
        { bits: 6 },
        { bits: 1, name: "NF" },
        { bits: 1, name: "FF" },
        { bits: 4, name: "META" },]
    ]
}, {
    label: "Pass", render: [
        [{ bits: 28 },
        { bits: 4, name: "Instr=0" },]
    ]
}, {
    label: "Consume", render: [
        [{ bits: 1, name: "EMPTY" },
        { bits: 27 },
        { bits: 4, name: "Instr=1" },]
    ]
}, {
    label: "GOTO", render: [
        [{ bits: 28, name: "State Pointer" },
        { bits: 4, name: "Instr=2" },]
    ]
}, {
    label: "Set Production", render: [
        [{ bits: 28, name: "Production Value" },
        { bits: 4, name: "Instr=3" },]
    ]
}, {
    label: "Reduce Accumulated", render: [
        [{ bits: 16, name: "0xFFFF" },
        { bits: 12, name: "Function Body Id" },
        { bits: 4, name: "Instr=4" },]
    ]
}, {
    label: "Reduce Normal", render: [
        [{ bits: 3, },
        { bits: 13, name: "Body Id" },
        { bits: 12, name: "# of Sym" },
        { bits: 4, name: "Instr=4" },]
    ]
}, {
    label: "Token Length", render: [
        [{ bits: 26, name: "Set To Length" },
        { bits: 2, name: "SW=1" },
        { bits: 4, name: "Instr=5" },]
    ]
}, {
    label: "Token Assign", render: [
        [{ bits: 26, name: "Token Id" },
        { bits: 2, name: "SW=2" },
        { bits: 4, name: "Instr=5" },]
    ]
}, {
    label: "Fork To", render: [
        [{ bits: 28, name: "# Fork States" },
        { bits: 4, name: "Instr=6" },]
    ]
}, {
    label: "Scan Back Until", render: [
        [{ bits: 16, name: "# Token IDs" },
        { bits: 4, },
        { bits: 4, name: "SW=1" },
        { bits: 4, },
        { bits: 4, name: "Instr=7" },]
    ]
}, {
    label: "Scan Until", render: [
        [{ bits: 16, name: "# Token IDs" },
        { bits: 4, },
        { bits: 4, name: "SW=0" },
        { bits: 4, },
        { bits: 4, name: "Instr=7" },]
    ]
}, {
    label: "Set Scope", render: [
        [{ bits: 28, name: "Scope Id" },
        { bits: 4, name: "Instr=8" },]
    ]
}, {
    label: "Table Branch", render: [
        [{ bits: 16, name: "Token Basis" },
        { bits: 6 },
        { bits: 4, name: "Mode" },
        { bits: 2, name: "Lex Type" },
        { bits: 4, name: "Instr=9" },],
        [{ bits: 32, name: "Scanner Entry Pointer" },],
        [{ bits: 16, name: "# Rows" },
        { bits: 16, name: "# Entries" },]
    ]
}, {
    label: "Hash Branch", render: [
        [{ bits: 16, name: "Token Basis" },
        { bits: 6 },
        { bits: 4, name: "Mode" },
        { bits: 2, name: "Lex Type" },
        { bits: 4, name: "Instr=10" },],
        [{ bits: 32, name: "Scanner Entry Pointer" },],
        [{ bits: 16, name: "Modulo Base" },
        { bits: 16, name: "# Entries" },]
    ]
}, {
    label: "Set Fail State", render: [
        [{ bits: 28, name: "Fail State Pointer" },
        { bits: 4, name: "Instr=11" },]
    ]
}, {
    label: "Repeat", render: [
        [{ bits: 28, name: "Origin" },
        { bits: 4, name: "Instr=12" },]
    ]
}, {
    label: "Not In Scopes", render: [
        [{ bits: 28, name: "# Of Scopes" },
        { bits: 4, name: "Instr=13" },]
    ]
}, {
    label: "Not Used", render: [
        [{ bits: 28 },
        { bits: 4, name: "Instr=14" },]
    ]
}, {
    label: "Fail", render: [
        [{ bits: 28 },
        { bits: 4, name: "Instr=15" },]
    ]
}, {
    label: "Fall Through", render: [
        [{ bits: 1, name: "FTS" },
        { bits: 27 },
        { bits: 4, name: "Instr=15" },]
    ]
}];

const options = {
    hspace: 888,
    vspace: 45,
    fontsize: 9

};

import fsp from "fs/promises";

const out_data = [];

for (const { label, description, svg } of data.map(d => ({
    label: d.label,
    description: d.description,
    svg: d.render.map(d => onml.stringify(render(d, options)))
}))) {
    const name = label.split(/ /g).join("_");

    fsp.writeFile(`./site/resources/img/${name}.bytecode.svg`, svg.join("\n"), { encoding: "utf8" });
    out_data.push(`### ${label}\n`);
    out_data.push(`![${label} SVG](./resources/img/${name})`);
    out_data.push("\n");
    out_data.push(description ?? "");
    out_data.push("\n");
}

fsp.writeFile("./site/architecture.bytecode.index.md", out_data.join("\n"), { encoding: "utf8" });