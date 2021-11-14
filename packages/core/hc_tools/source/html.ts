import URI from '@candlelib/uri';
import {
    convert_symbol_to_string,
    fail_state_mask,
    getEntryPointers,
    goto_state_mask,
    GrammarObject,
    normal_state_mask,
    ReverseStateLookupMap
} from "@hc/common";
import { renderHTMLStateFromBytecode } from './assembly.js';

export function renderByteCodeSheet(
    bytecode: Uint32Array,
    states_lookup: ReverseStateLookupMap,
    grammar?: GrammarObject,
) {

    const name = grammar ? new URI(grammar.URI).filename : "Unnamed";

    const entry = grammar ? getEntryPointers(grammar, new Map([
        ...states_lookup.entries()
    ].map(([, b]) => {
        return [b.name, b.pointer];
    }))) : [];

    const html_buffer = [];

    console.log(entry.map(e => {
        return `<li><h4><a href="#${e.name}_open">${e.name}</a></h4></li>`;
    }));

    for (const [ptr] of states_lookup)
        html_buffer.push(renderHTMLStateFromBytecode(ptr, bytecode, states_lookup, grammar));

    html_buffer.unshift(`
    <DOCTYPE html>
    <html>
        <head>
            <title>${name} Bytecode Sheet </title>
            ${css()}
        <body>
        <h1>${name} Bytecode Sheet </h1>
        
        <p> Total Size: ${(bytecode.length * 4).toLocaleString()} bytes</p>
        <p> Number of states: ${states_lookup.size}</p>
  
        <h2>Entry Productions</h2>
            <ol>
            ${entry.map(e => {
        return `<li><h4><a href="#${e.name}_open">${e.name}</a></h4></li>`;
    })}</ol>
        <h2>States</h2>
        
        <ol class="state-index">
        ${[...states_lookup.entries()].map(([, state], i) => {

        const name = state.name;

        const markers = [];
        if (state.pointer & goto_state_mask)
            markers.push("<span class=\"goto-marker\"></span>");


        if (state.pointer & fail_state_mask)
            markers.push("<span class=\"fail-marker\"></span>");

        if (state.pointer & normal_state_mask)
            markers.push("<span class=\"reg-marker\"></span>");

        return `<li class="state-ref"><a href="#${name}"><p>${name.replace(/\_+/g, " ")}</p><p>ptr: 0x${(state.pointer & 0xFFFFFF) * 4}${markers.join(" ")}</p></a></li>`;
    }).join("")}</ol>
        <h2>Token Reference</h2>
        <div class="tokens">
            ${[...(grammar?.meta.all_symbols.by_id.entries() ?? [])].map(([key, val]) => {
        if (key >= 0) {
            return `<div class="token-ref">[${key}] ${convert_symbol_to_string(<any>val)}</div>`;
        } else {
            return "";
        }
    }).join("\n")}
        </div>
        `);
    html_buffer.push(`
<script>
    const states = new Set([${[...states_lookup.values()].map(s => `"${s.name}"`).join(",\n")}])
    const stack = [];
    let stack_target = null;
    let stack_entries = null;
    window.addEventListener("load",()=>{
        
        //Initialize stack
        stack_target = document.createElement("div");
        stack_target.classList.add("stack-view")
        document.body.appendChild(stack_target);

        stack_target.innerHTML = \`
<div class="stack-entries">
</div>
<button>pop</button>
        \`

        stack_entries = stack_target.children[0];
        
        const stack_button = stack_target.children[1];

        stack_button.addEventListener("click",popStack)

        //Add event listener to each state transition system. 
        const anchors = document.querySelectorAll("a");

        for(const anchor of anchors){
            const href = anchor.getAttribute("href").toString().slice(1);

            if(states.has(href)){
                ((href, a)=>anchor.addEventListener("click", e=>{

                    if(!a.classList.contains("scanner"))
                        popStack();

                    const group = [{href, a}];

                    let sibling = a.parentElement.previousElementSibling;

                    while(sibling){
                        if(sibling.classList[0] == "instruction-line"){
                            const goto = sibling.querySelector(".goto");
                            if(goto){
                                const href = goto.getAttribute("href").toString().slice(1);
                                group.push({href, a:goto})
                            }
                            sibling = sibling.previousElementSibling;
                        }else {
                            sibling = null;
                        }
                    }

                    for(const obj of group.reverse())
                        pushStack(obj);

                    renderStack();

                    const ele = document.getElementById(href);

                    if(ele){
                        ele.scrollIntoView({
                            behavior: "smooth",
                            inline:"start",
                            block:"start",
                        });
                        history.pushState(null, null, '#'+href);
                    }
                    

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }))(href, anchor)
            }
        }
    });

    function renderStack(){

        stack_entries.innerHTML = "";

        const children = stack.map(s=>{
            const div = document.createElement("div");
            div.classList.add("stack-entry");
            div.innerHTML = \`<a href="#\${s.href}\">\${s.href.replace(/\\_+/," ")}</a>\`
            return div;
        })

        for(const child of children.reverse()){
            stack_entries.appendChild(child);
        }
    }
    
    function pushStack(e){
        stack.push(e);
    }

    function popStack(e){
        const last = stack.pop();
        last.a.scrollIntoView({
            behavior: "smooth",
            inline:"center",
            block:"center",
        });
        renderStack();
    }

    function popStack(e){
        const last = stack.pop();
        const next = stack.slice(-1)[0]
        if(next){
            const ele = document.getElementById(next.href);
            if(ele){
                ele.scrollIntoView({
                    behavior: "smooth",
                    inline:"start",
                    block:"start",
                });
                history.pushState(null, null, '#'+next.href);
            }
        }
        
        renderStack();
    }
</script>`,
        "</body></html>");

    return html_buffer.join("\n");
}

function css() {
    return `<style>
                body{
                    max-width:960px;
                    margin:auto;
                    padding: 0 20px;
                    font-family: ubuntu, roboto, arial, "sans-serif";
                    font-size:12px;
                    color:#333;
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
    
                h1, h2 {
                    margin: 40px 0 10px;
                }
    
                .ir pre{ 
                    font-size:10px;
                    padding:20px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    white-space: -moz-pre-wrap;
                    white-space: -pre-wrap;
                    white-space: -o-pre-wrap;
                    word-wrap: break-word;
                }
    
                .state {
                    margin: 10px 0 20px 0;
                    border-top: 4px solid #e9e9e9;
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

                }
            </style>`;
}
