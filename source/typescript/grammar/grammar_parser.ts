import wind from "@candlefw/wind";

import hcg_parser_data from "./hcg.js";
import { lrParse as parser } from "../lr/runtime/lr_parser.js";

import convertProductionNamesToIndexes from "./convert_production_names.js";
import compileProduction from "./compile_production.js";
import importGrammarFile from "./import_grammar_file.js";
import importProduction from "./import_production_constructor.js";
import groupProduction from "./group_production_constructor.js";
import listProduction from "./list_production_constructor.js";
import body from "./production_body_constructor.js";

import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";
import { ParserEnvironment } from "../types/parser_environment.js";


async function sleep(data: AwaitTracker): Promise<void> {
    return new Promise(res => {
        const id = setInterval(() => {
            if (data.count == 0) {
                clearInterval(id);
                res();
            }
        }, 2);
    });
}

export type AwaitTracker = {
    count: number;
};

function constructCompilerEnvironment(
    grammar_file_url: any,
    global_pending_files: { count: number; },
    local_pending_files: { count: number; },
    unique_grammar_file_id: number,
    meta_imported_productions: Map<any, any>
): GrammarParserEnvironment {
    const out = {
        options: { integrate: true },
        SLEEP: sleep,
        bodies: new Map(),
        grammarParser,
        FILE_URL: grammar_file_url,
        PENDING_FILES: global_pending_files,
        AWAIT: local_pending_files,
        productions: <Grammar>[],
        refs: new Map(),
        body_count: 0,
        stamp: unique_grammar_file_id,
        imported_grammar_name_resolution_map: new Map(),
        meta_imported_productions,
        body_offset: 0,
        prod_name: '',
        counter: 100,
        functions: {
            importProduction,
            importData: importGrammarFile,
            body,
            groupProduction,
            listProduction,
            compileProduction
        }
    };

    out.productions.meta = {
        preambles: []
    };

    return out;
}

export async function grammarParser(
    grammar_string, grammar_file_url,
    unique_grammar_file_id = 112,
    meta_imported_productions = new Map,
    global_pending_files = { count: 0 }
): Promise<Grammar> {
    const
        local_pending_files = { count: 0 },

        env = <ParserEnvironment>constructCompilerEnvironment(
            grammar_file_url,
            global_pending_files,
            local_pending_files,
            unique_grammar_file_id,
            meta_imported_productions
        ),

        result = parser(
            wind(grammar_string),
            //@ts-ignore
            hcg_parser_data,
            env,
            //(await import("@candlefw/hydrocarbon/source/grammars/hcg/hcg.debug_info.js")).default
        ),

        grammar = <Grammar>result.value;


    if (result.error) { throw result.error; }

    grammar.uri = grammar_file_url;

    //load in productions from the current grammar file into Lookup
    grammar.LU = new Map(grammar.map(p => [<string>p.name, p]));


    //Pause here to allow impoted productions to process.
    await sleep(local_pending_files);


    //Reload all productions that have been identified in all grammar files.
    grammar.LU = new Map(grammar.map(p => [<string>p.name, p]));

    //Pull out function references from env. TODO: move function refs to grammar.
    const ref_functions = env.refs;

    grammar.functions = ref_functions;


    //If the production is at the root of the import tree, then complete the processing of production data. 
    if (unique_grammar_file_id == 112) {

        await sleep(global_pending_files);
        //Convenient lookup map for production non-terminal names. 

        //Setup the productions object
        grammar.forEach((p, i) => (p.id = i));
        grammar.symbols = null;
        grammar.meta = grammar.meta || {};
        grammar.reserved = new Set();

        convertProductionNamesToIndexes(grammar, grammar.LU);

        //Insure meta error and ignore arrays are present to prevent errors in grammar compiling,
        //since no checks are done before their properties are accessed.

        if (!grammar.meta.error)
            grammar.meta.error = [];

        if (!grammar.meta.ignore)
            grammar.meta.ignore = [];

        for (const pre of grammar.meta.preambles) {
            if (pre)
                switch (pre.type) {
                    case "error":
                        grammar.meta.error.push(pre);
                        break;
                    case "ignore":
                        grammar.meta.ignore.push(pre);
                        break;
                    case "symbols":
                        if (!grammar.meta.symbols)
                            grammar.meta.symbols = new Map(pre.symbols.map(e => !e.type ? [e, { val: e }] : [e.val, e]));
                        else {

                            pre.symbols.forEach(e => !e.type
                                ? grammar.meta.symbols.set(e, { val: e })
                                : grammar.meta.symbols.set(e.val, e)
                            );
                        } break;
                }
        }

        //  throw 1;
    }

    if (grammar.length == 0)
        throw ("This grammar does not define any productions.");

    return grammar;
}

