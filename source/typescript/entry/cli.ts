/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import spark from "@candlelib/spark";
import URL from "@candlelib/uri";
import { getProcessArgs, initWickCLI } from "@candlelib/paraffin";

await URL.server();

interface arguments {
    debug: boolean;
}

const
    args = getProcessArgs<arguments>({
        debug: true
    });
const { wick } = await initWickCLI();

await wick.cli("next", `
import {URL, exit} from "@model"
var data = null, file_path = "", file_dir = "f";

function click (){
    exit();
}

function $test (){
    file_dir = file_path +"AAAf";
}

<style>
    root {  width:100%; background-color:black; color:white; }

    h1 { padding-top:2px; width:100%; }

    #caption{ color:orange }

    #button{ color: red }

</style>;

export default<div>

    <h1> NEXT PAGE <input id="button" type="button" onclick=\${click} placeholder="grammar_file_path"/></h1>
</div>
`);

const start_view = await wick.cli("home", `

import {URL, exit, loadView} from "@model"

var data = null, file_path = "", file_dir = "f";

function click (){ loadView("next"); }

function $test (){
    file_dir = file_path +"AAAf";
}

<style>
    root {  width:100%; background-color:black; color:white; }

    h1 { padding-top:2px; width:100%; }

    #caption{ color:orange }

    #button{ color: red }

</style>;

export default<div>

    <h1>Candle Library Hydrocarbon <span id="caption"> Yet Another Parser Compiler </span> </h1>

    <div>\${file_dir}</div>
    
    <label>Enter a grammar file path \${URL.resolveRelative(file_path)}</label>
    
    <input type="text" value=\${file_path} placeholder="grammar_file_path"/>

    <input id="button" type="button" onclick=\${click} placeholder="grammar_file_path"/>
</div>
`);


start_view.start();

await spark.sleep(5000);

process.exit();
