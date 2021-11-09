import render from "bit-field/lib/render.js";
import onml from "onml";

const data = [{
    label: "Pointer", description:
        `Every state is represented by a series of 32bit instructions stored in 
the bytecode buffer. A 32bit pointer is used to locate the head of a state's 
instruction sequence offset from the 0th index of the bytecode buffer. When parsing, 
an entry pointer is passed as an argument to the recognizer to start the parsing at 
a suitable entry state.

The actual pointer index is stored in the first 24bits of the pointer word, giving an address range of 
0x000000 to 0xFFFFFF and a maximum bytecode size of 16,777,216 words or 68MB. 

The uppermost 8bits are reserved as "meta" data, including three flag bits:
- \`GT\` - bit 25 - Indicates pointed to state is a GOTO. This is used to determine fork join points. 
- \`NM\` - bit 26 - Indicates the state is active during normal mode parsing.
- \`FL\` - bit 27 - Indicates the state is active during fail mode parsing.

The last 4 bit (\`Instruction\`) is reserved for instruction data. This allows a full state pointer
to serve as both an inline instruction as well as a plain state pointer. This 
feature is leveraged with GOTO instruction, allowing such words to be simply copied to 
the state stack when it is decoded.

# Instructions

`, render: [
        [{ bits: 24, name: "Instruction Word Address" },
        { bits: 1 },
        { bits: 1, name: "GT" },
        { bits: 1, name: "NF" },
        { bits: 1, name: "FF" },
        { bits: 4, name: "Instruction" },]
    ]
}, {
    label: "Pass", render: [
        [{ bits: 28, name: "Zeroed" },
        { bits: 4, name: "Instr=0" },]
    ], description: `
#### Assembly name: \`END_\`

Sets the ERROR flag to \`0x0\` then exits the instruction decoder 
and returns control to the state decoder.
`}, {
    label: "Consume", render: [
        [{ bits: 1, name: "EMPTY" },
        { bits: 27 },
        { bits: 4, name: "Instr=1" },]
    ], description: `
#### Assembly name: \`EAT_\`
`
}, {
    label: "GOTO", render: [
        [{ bits: 28, name: "State Pointer" },
        { bits: 4, name: "Instr=2" },]
    ], description: `
#### Assembly name: \`GOTO\`
    `
}, {
    label: "Set Production", render: [
        [{ bits: 28, name: "Production Value" },
        { bits: 4, name: "Instr=3" },]
    ], description: `
#### Assembly name: \`EAT_\`
    `
}, {
    label: "Reduce Accumulated", render: [
        [{ bits: 16, name: "0xFFFF" },
        { bits: 12, name: "Function Body Id" },
        { bits: 4, name: "Instr=4" },]
    ], description: `
#### Assembly name: \`EAT_\`
    `
}, {
    label: "Reduce Normal", render: [
        [{ bits: 3, },
        { bits: 13, name: "Body Id" },
        { bits: 12, name: "# of Sym" },
        { bits: 4, name: "Instr=4" },]
    ], description: `
#### Assembly name: \`RED_\`
    `
}, {
    label: "Token Length", render: [
        [{ bits: 26, name: "Set To Length" },
        { bits: 2, name: "SW=1" },
        { bits: 4, name: "Instr=5" },]
    ], description: `
#### Assembly name: \`TKLN\`
    `
}, {
    label: "Token Assign", render: [
        [{ bits: 26, name: "Token Id" },
        { bits: 2, name: "SW=2" },
        { bits: 4, name: "Instr=5" },]
    ], description: `
#### Assembly name: \`TKID\`
    `
}, {
    label: "Token Assign And Consume", render: [
        [{ bits: 26, name: "Token Id" },
        { bits: 2, name: "SW=2" },
        { bits: 4, name: "Instr=5" },]
    ], description: `
#### Assembly name: \`TKCS\`
    `
}, {
    label: "Fork To", render: [
        [{ bits: 28, name: "# Fork States" },
        { bits: 4, name: "Instr=6" },]
    ], description: `
#### Assembly name: \`FORK\`
    `
}, {
    label: "Scan Back Until", render: [
        [{ bits: 16, name: "# Token IDs" },
        { bits: 4, },
        { bits: 4, name: "SW=1" },
        { bits: 4, },
        { bits: 4, name: "Instr=7" },]
    ], description: `
#### Assembly name: \`SCNB\`
    `
}, {
    label: "Scan Until", render: [
        [{ bits: 16, name: "# Token IDs" },
        { bits: 4, },
        { bits: 4, name: "SW=0" },
        { bits: 4, },
        { bits: 4, name: "Instr=7" },]
    ], description: `
#### Assembly name: \`SCNF\`
    `
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
    ], description: `
#### Assembly name: \`JMPT\`
    `
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
    ], description: `
#### Assembly name: \`HASH\`
    `
}, {
    label: "Set Fail State", render: [
        [{ bits: 28, name: "Fail State Pointer" },
        { bits: 4, name: "Instr=11" },]
    ], description: `
#### Assembly name: \`SETF\`
    `
}, {
    label: "Repeat", render: [
        [{ bits: 28, name: "Origin" },
        { bits: 4, name: "Instr=12" },]
    ], description: `
#### Assembly name: \`RPT_\`
    `
}, {
    label: "Not Used", render: [
        [{ bits: 28 },
        { bits: 4, name: "Instr=14" },]
    ]
}, {
    label: "Fail", render: [
        [{ bits: 28 },
        { bits: 4, name: "Instr=15" },]
    ], description: `
#### Assembly name: \`FAIL\`
    `
}, {
    label: "Fall Through", render: [
        [{ bits: 1, name: "FTS" },
        { bits: 27 },
        { bits: 4, name: "Instr=15" },]
    ], description: `
#### Assembly name: \`FALL\`
    `
}];

const options = {
    hspace: 888,
    vspace: 60,
    fontsize: 12,


};

import fsp from "fs/promises";

const out_data = [];

for (const { label, description, svg } of data.map(d => ({
    label: d.label,
    description: d.description,
    svg: d.render.map(d => onml.stringify(render(d, options)))
}))) {
    const name = label.split(/ /g).join("_");

    let i = 0;

    for (const svg_file of svg) {
        fsp.writeFile(`./site/resources/img/${name}.${i++}.bytecode.svg`, svg_file, { encoding: "utf8" });
    }

    out_data.push(`## ${label}\n`);

    i = 0;
    for (const _ of svg) {
        out_data.push(`![${label} SVG](./resources/img/${name}.${i++}.bytecode.svg)`);
    }
    out_data.push("\n");
    out_data.push(description ?? "");
    out_data.push("\n");
}

fsp.writeFile("./site/architecture.bytecode.index.md", out_data.join("\n"), { encoding: "utf8" });