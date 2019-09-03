import { getToken, types } from "../util/common.mjs";

function renderSymbols(symbols, verbose = true) {
    return JSON.stringify(symbols);
}

function renderGotoMap(goto_maps, verbose = true) {
    return [...goto_maps.values()].map(v => `gt${v.id}[]{${v.goto.join(",")}}`).join((verbose) ? ",\n" : ",");
}

function renderStateMaps(state_maps, verbose = true) {
    return state_maps.map((sm, i) => `sm${i}[]{${sm.join(",")}}`).join((verbose) ? ",\n" : ",");
}

function renderSymbolLookUp(SYM_LU) {
    return [...SYM_LU.entries()]
        .filter(e=>e[0] !== undefined)
        .map(e =>`{${typeof e[0] == "string" ? "L"+JSON.stringify(e[0]) : `wstring(1, (wchar_t) ${e[0] | 0xF00000})`},${e[1]}}`)
        .join(",\n");
}

function renderStatePointers(state_pointer, verbose = true) {
    return state_pointer.map(s => `${s}`).join((verbose) ? "," : ",");
}

function renderGotoPointers(goto_pointers, verbose = true) {
    return goto_pointers.map(s => `${s}`).join((verbose) ? "," : ",");
}

function renderErrorHandlers(error_handlers, verbose = true) {
    return error_handlers.map(m => `&${m}`).join((verbose) ? "," : ",");
}

function renderFunctions(functions, verbose = true) {
    return functions.length > 0 ? "\n" + functions.join((verbose) ? ",\n" : ",") + "," : "";
}

function renderStateActionFunctions(state_action_functions, verbose = true) {
    return state_action_functions.join((verbose) ? ",\n" : ",");
}

export function Compiler(
    goto_maps,
    state_maps,
    state_pointers,
    SYM_LU,
    default_error,
    error_handlers,
    functions,
    state_action_functions,
    goto_pointers,
    GEN_SYM_LU,
    symbols) {
    return (
`
#include <map>
#include <unordered_map>
#include <algorithm>
#include <cstring>
#include "./tokenizer.h"
#include "./parser.h"
#include "./nodes.h"

namespace ${"HC_TEMP"}{
    using namespace std;
    using namespace HC_NODES;

    typedef HC_Tokenizer::Token Token;
    typedef unordered_map<wstring, unsigned> SymbolLookup;
    typedef int(*StateAction)(Token&, unsigned, void **);
    typedef int(*ErrorAction)(Token&, unsigned, void **);
    typedef void * (* Action)(Token&, unsigned, unsigned, int, void **);

    void reduceToNull(int plen, int& output_offset, void ** output){
        if (plen > 0) {
            auto ln = max(output_offset - plen + 1, 0);
            output[ln] = output[output_offset];
            output_offset = ln;
        }
    }

    void reduceToValue(Token& tk, int& output_offset, void ** output, int plen, Action action, unsigned bitfield){
        auto ln = max(output_offset - plen + 1, 0);
        output_offset = ln;
        output[ln] = (* action)(tk, plen, bitfield,  ln, output);

        cout << "output: " <<(long long) output[ln] << endl;
    }

    int e(Token& tk, unsigned output_offset, void ** output){
        return -1;
    }

    int emptyFunction(Token& tk, unsigned output_offset, void ** output){
        return -1;
    }

    /************** Maps **************/
    int
        ${renderGotoMap(goto_maps)},
        ${renderStateMaps(state_maps)}
    ;

    int 
        // State Lookup
        * state_lookup[]{${renderStatePointers(state_pointers)}},
        //Goto Lookup
        * goto_lookup[]{${renderGotoPointers(goto_pointers)}}
    ;

    // Symbol Lookup map
    SymbolLookup symbol_lu{${renderSymbolLookUp(SYM_LU, true)}};

    //Lexer Symbol Array
    wstring tk_symbols[${symbols.length}]{${symbols.map(s=>"L"+JSON.stringify(s)).join(",")}};

    /************ Functions *************/
    //Error Functions
    ErrorAction error_actions[]{${renderErrorHandlers(error_handlers, true)}};
    int (* const state_actions[${state_action_functions.length}])(Token&, int&, void **){${renderStateActionFunctions(state_action_functions, true)}};
}`);
}
