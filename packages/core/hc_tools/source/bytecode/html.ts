import URI from '@candlelib/uri';
import { build } from "esbuild";
import {
    convert_symbol_to_string,
    fail_state_mask,
    getEntryPointers,
    goto_state_mask,
    GrammarObject,
    normal_state_mask,
    ReverseStateLookupMap,
    convert_symbol_to_friendly_name
} from "@hctoolkit/common";
import * as fsp from "fs/promises";
import { renderHTMLStateFromBytecode } from './assembly.js';


// Store everything a self contained HTML file that can be used to 
// evaluate a grammar and its bytecode
export async function renderByteCodeSheet(
    bytecode: Uint32Array,
    states_lookup: ReverseStateLookupMap,
    grammar: GrammarObject,
): Promise<string> {
    const
        entry_pointers = grammar ? getEntryPointers(grammar, new Map([
            ...states_lookup.entries()
        ].map(([, b]) => {
            return [b.name, b.pointer];
        }))) : [],
        data_url = await URI.resolveRelative('./client_app.js', URI.getEXEURL(import.meta)),
        result = await build({
            platform: "browser",
            format: "esm",
            minify: false,
            entryPoints: [data_url + ""],
            bundle: true,
            write: false,
            outdir: "out"
        }),
        temp_text = "<div -href go>",
        html_buffer = [

            `<DOCTYPE html>
            <style>${css().replace(/\n/g, "\n        ")}</style>
        <html>
        <head>
        </head>
        <body>
        <div id=app>
        <header>
            <textarea id=text-input>${temp_text}</textarea>
            <div id=text-output></div>
        </header>
        <div id=content>
        <div id=content-center><pre id=debug-output></pre></div>
            <div id=content-left> </div>
            <div id=content-right></div>
        </div>
        <footer>
            <button id=prev>prev</button>
            <button id=next>next</button>
            <button id=start>start</button>
        </footer>
        </div>
        
        <script type=module>
        ${result.outputFiles[0].text}
        </script>
        <script>`,
            `const t = new Map(
            [
                ${[
                ...(grammar.meta?.all_symbols?.by_id.entries() ?? [])
            ].map((
                [id, sym]
            ) => {
                return `[${id}, "${convert_symbol_to_friendly_name(sym).replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")}"]`;
            }).join(",\n")}
            ]
        );`,
            `const pn = [${grammar.productions.map((b, i) => `"${b.name ?? "unknown"}"`).join(",\n")}]`,
            `const bc = [${[...bytecode]}];`,
            `const e = [${[...entry_pointers.entries()].map(([id, sym]) => `["${sym.name}", ${sym.pointer}]`)}]`,
            `const s = [${[...states_lookup.entries()].map(([id, sym]) => `[${id}, ${JSON.stringify(sym)}]`)}]`,
            `window.onload = (()=>hc_init(t,pn, bc, e,s))`,
            `</script>
        </body>
        </html>`,
        ];

    return html_buffer.join("\n");
}

function css() {
    return `
body{
    max-width:960px;
    margin:0;
    padding:0;
    height:100%;
    font-family: ubuntu, roboto, arial, "sans-serif";
    font-size:12px;
    color:#333;
}

#app{
    position:relative;
    width:100vw;
    height:100vh;
    top:0;
    left:0;
    display:flex;
    flex-direction:column;
    align-items:center
}

footer, header {  
    display: flex;
    flex-direction:row;
    position: relative;
    margin: 0;
    bottom: 0;
    height: 120px;
    flex-grow: 0;
}

header {
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
}

#text-input, #text-output{
    font-family: monospace;
    width: 463px;
    height: 40px;
    color: white;
    padding: 5px;
    background: #333333;
    border-radius: 3px;
    text-align: center;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

#content {
    max-width:1080px;
    width:100%;
    display:flex;
    justify-content: space-between;
    flex-direction:row;
    flex-grow:1;
}

#content-left,
#content-center,
#content-right {
    flex-grow:0;
    width:20%;
    position:relative;
    min-height: 300px;
}

#content-center {
    width:60%;
}

.action {
    margin: 10px 0;
}


/* stack data */

.stack-entry {
    height:20px;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor:pointer;
}

.stack-entry-number{
    padding: 3px;
    color: #2b48b7;
    width: 25px;
    text-align: center;
    font-weight: 800;
    border-radius: 5px;
}

.stack-entry-number:hover,
.stack-entry:hover .stack-entry-number {
    background: rgb(200,190,180);
    color:white;
}

.stack-entry.se-active .stack-entry-number {
    color:orange
}

.stack-entry.se-active:hover .stack-entry-number {
    color:white
}

.stack-entry-string {
    padding: 5px;
    color:green
}

.stack-char {
    display:inline-block;
}

.stack-entry-obj {
    padding: 5px;
    font-size:10px;
}

.stack-entry-obj-details {
    display: none;
    position: absolute;
    top: 20px;
    left: 30px;
    white-space: pre;
    padding: 10px;
    background: white;
    z-index: 1;
    border-radius: 3px;
    box-shadow: 2px 2px 8px #00000057;
}

.stack-entry:hover .stack-entry-obj-details{
    display:block
}

/* Stack Token Diagram */

.stack-token-diagram {
    padding-left:5px;
    border-left:1px solid transparent;
}

.stack-token-diagram:hover {
    border-left:1px solid #00000030;
}

.stack-token-diagram h1 {
    font-size:11px;
    width:100%;
}

.stack-token-diagram-string {
    color:green;
    font-size:10px;
    font-weight:bold;
    padding-left:10px;
}


/* Token */

.token-highlight {
    color:red;
}

.token-newline {
    color: #4ae3d6;
    width: 11px;
    background-color: #368a9d;
    text-align: center;
    font-weight: 700;
    font-size: 10px;
    border-radius: 3px;
    line-height: 10px;
    padding: 3px;
    margin: 2px;
}

.token-space {
    color: #a7d6ff;
    width: 11px;
    padding: 3px;
    margin: 2px;
    background: #52a7f1c7;
    text-align: center;
    font-weight: 700;
    font-size: 10px;
    border-radius: 3px;
    line-height: 10px;
}

.token-highlight {
    color:red;
}

body.dm {
    color:#333;
}

a {
    text-decoration:none;
    color:unset;
    outline:none;
}

h1 {
    font-size: 4em
}
.ir pre{ 
    font-size:8px;
    padding:20px;
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
}

.dm .state {
    border-top: 4px solid #e9e9e9;
}

.state-header h2 {
    display:inline-block;
}

.address {
    font-family: monospace;
    display:inline-block;
    padding:0 3px;
    color: #ffffff;
    background-color: rgb(203 122 64);
    border-radius:2px;
    font-weight:bold;
}

.instruction-label {
    font-family: monospace;
    width: 80px;
    margin-left: 120px;
    display: inline-block;
    padding: 0 3px;
    color: white;
    background-color: rgb(126 114 149);
    border-radius: 2px;
    font-weight: bold;
    margin-right: 13px;
    text-align: center;
}

.goto {
    margin: 0 10px;
    text-transform: uppercase;
    text-decoration:none;
    color:#68a5ff;
    outline:none;
    font-weight:bold;
}

.goto:hover {
    color: #0067ff;
}

.instruction-line {
    padding:2px;
    padding-left: 50px;
    margin: 0px;
    font-weight: bold;
}

*.instruction-line:nth-child(2n){
    background-color:#e5e5e5
}

*.instruction-line:nth-child(2n) .address{
    background-color:rgb(159 92 23);
}

.jumptable, .hashtable {
    position:relative;
    background-color: #908b9714;
    padding: 10px 0;
    margin: 30px 0px 5px 0px;
    border-radius: 2px;
    box-shadow: 2px 5px 10px #8f8f8f;
    z-index:1;
}

.table-branch h5 {
    font-size: 1.1em;
    margin: 10px 50px;
}

.table-data {
    width: fit-content;
    position: relative;
    display: block;
    margin: 5px 50px;
    padding: 10px;
    font-size: 1em;
}

.instructions {
    padding: 0 20px;
}

.hash-pointers {
    font-size: 1em;
    margin-left: 50px;
}

.character-position {
    position:absolute;
    left:222px;
}

.class {
    display:inline-block;
    padding: 3px;
    color: white;
    background-color: #ff5656;
    border-radius: 2px;
    min-width: 80px;
    text-align: center;
}

.codepoint {
    display:inline-block;
    padding: 3px;
    color: white;
    background-color: #3ca99e;
    border-radius: 2px;
    width: 80px;
    text-align: center;
}

.token {
    display: inline-block;
    padding: 3px;
    color: white;
    background-color: #3ca99e;
    border-radius: 2px;
    min-width: 80px;
    text-align: center;
}

.production {
    padding: 3px;
    color: white;
    background-color: #713399;
    border-radius: 2px;
    text-align: center;
}

.state-index {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    /* flex-basis: fit-content; */
    /* flex-direction: row; */
    width: 100%;
    /* position: relative; */
    /* flex-wrap: wrap; */
}

.state-ref {
    margin: 10px 38px 10px 0px;
    padding: 3px;
    border: 1px solid #ededed;
    border-radius: 4px;
    transition:all 100ms;
}

.state-ref:hover {
    color:white;
    background-color: #544a4a;
}

.state-ref a {
    outline:none;
    text-decoration:none;
}

.state-ref p { 
    padding:1px;
    margin:1px;
    border:none;
}

.goto-marker, .fail-marker, .reg-marker {
    display:inline-block;
    position:relative;
    width:10px;
    height:10px;
    margin: 0 2px;
    border-radius:2px;
    float:right;
}
.fail-marker {
    background-color:#c15f5f;
}
.goto-marker {
    background-color:#78d578;
}
.reg-marker {
    background-color:#777797;
}

.stack-view {
    position: fixed;
    width: 200px;
    bottom: 50%;
    right: 20px;
    padding: 20px;
    transition: all 300ms;
    background-color: white;
    box-shadow: 2px 2px 10px #d7d7d7;
    z-index: 8;
}

.stack-view.hidden{
    height:10px;
}

.stack-entry {

}`;
}
