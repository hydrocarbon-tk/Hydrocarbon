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

const namespace = "HC_TEMP";

    return (
`#pragma once

#include <unordered_map>
#include <algorithm>
#include <cstring>
#include "./tokenizer.h"
#include "./parse_buffer.h"

namespace ${namespace}{
    using std::wstring;
    using std::unordered_map;
    using std::max;
    using std::cout;
    using std::endl;

    typedef HC_Tokenizer::Token Token;
    typedef unordered_map<wstring, unsigned> SymbolLookup;
    typedef int(*StateAction)(Token&, unsigned, void **);
    typedef int(*ErrorAction)(Token&, unsigned, void **);

    inline void reduceToNull(int plen, int& output_offset, void ** output){
        if (plen > 0) {
            auto ln = max(output_offset - plen + 1, 0);
            output[ln] = output[output_offset];
            output_offset = ln;
        }
    }

    inline int e(Token& tk, unsigned output_offset, void ** output) {
        return -1;
    }
    /************** Maps **************/

    const int
        ${renderGotoMap(goto_maps)},
        ${renderStateMaps(state_maps)}
    ;

    template <class NodeFunctions>
    struct Data {

        typedef ParseBuffer<char> ParseBuffer;

        typedef void * (* Action)(Token&, unsigned, unsigned, int, void **, ParseBuffer *);

    private:
        static void reduceToValue(Token& tk, int& output_offset, void ** output, int plen, Action action, unsigned bitfield, void * allocator) {
            auto ln = max(output_offset - plen + 1, 0);
            output_offset = ln;
            output[ln] = (* action)(tk, plen, bitfield,  ln, output, (ParseBuffer *)allocator);
        }
    public:
        
        static const int * state_lookup[];
        static const int * goto_lookup[];
        static const SymbolLookup symbol_lu;
        //Lexer Symbol Array
        static const wstring tk_symbols[];

        /************ Functions *************/
        //Error Functions
        static const ErrorAction error_actions[];
        static int (* const state_actions[])(Token&, int&, void **, void*);
    };


    template <class NodeFunctions>
    const ErrorAction ${namespace}::Data<NodeFunctions>::error_actions[] = {${renderErrorHandlers(error_handlers, true)}};

    template <class NodeFunctions>
    const int * ${namespace}::Data<NodeFunctions>::goto_lookup[] = {${renderGotoPointers(goto_pointers)}};

    template <class NodeFunctions>
    const int * ${namespace}::Data<NodeFunctions>::state_lookup[] = {${renderStatePointers(state_pointers)}};

    template <class NodeFunctions>
    const wstring ${namespace}::Data<NodeFunctions>::tk_symbols[] = {${symbols.map(s=>"L"+JSON.stringify(s)).join(",")}};

    template <class NodeFunctions>
    const SymbolLookup ${namespace}::Data<NodeFunctions>::symbol_lu = {
        ${renderSymbolLookUp(SYM_LU)}};

    template <class NodeFunctions>
    int (* const ${namespace}::Data<NodeFunctions>::state_actions[])(Token&, int&, void **, void*) = {
        ${renderStateActionFunctions(state_action_functions, true)}
    };
}
/--Split--/
`);
}
