import { ExportableStateData, fail_state_mask, goto_state_mask, normal_state_mask, scanner_state_mask } from '@hctoolkit/common/build';
import {
    DebugIterator,
    StringByteReader,
    ParseAction,
    ParseActionType,
    StateIterator,
    DebugState
} from "@hctoolkit/runtime";
import { start } from 'repl';


interface GrammarContext {
    tokens: Map<number, string>;
    production_names: string[];
    byte_code: Uint32Array,
    entries: Map<string, number>,
    states: Map<number, ExportableStateData>;
    active_entry: number,

    active_tree: any,
    active_stack: any[];

    parse_context: {
        input: string,
        parser: DebugIterator,
        current_state_index: number,
        states: DebugState[];
        stacks: any[][];
    };

    io: {
        input: HTMLTextAreaElement;
        output: HTMLDivElement;
        debug_output: HTMLDivElement;
        center: HTMLDivElement;
        left: HTMLDivElement;
        right: HTMLDivElement;
        next: HTMLButtonElement;
        prev: HTMLButtonElement;
        start: HTMLButtonElement;
    };
}

var global_grammar_context: GrammarContext;

function hc_init(
    tokens: [number, string][],
    production_names: string[],
    byte_code: number[],
    entries: [string, number][],
    states: [number, ExportableStateData][]

) {

    global_grammar_context = {
        byte_code: new Uint32Array(byte_code),
        entries: new Map(entries),
        states: new Map(states),
        production_names,
        tokens: new Map(tokens),
        //@ts-ignore
        parse_context: <GrammarContext["parse_context"]>null,
        active_entry: entries[0][1],
        active_stack: [],
        active_tree: null,
        io: {
            input: <HTMLTextAreaElement>document.getElementById("text-input"),
            output: <HTMLDivElement>document.getElementById("text-output"),
            next: <HTMLButtonElement>document.getElementById("next"),
            prev: <HTMLButtonElement>document.getElementById("prev"),
            start: <HTMLButtonElement>document.getElementById("start"),
            debug_output: <HTMLDivElement>document.getElementById("debug-output"),
            center: <HTMLDivElement>document.getElementById("content-center"),
            left: <HTMLDivElement>document.getElementById("content-left"),
            right: <HTMLDivElement>document.getElementById("content-right")
        }
    };

    global_grammar_context.io.start.addEventListener("click", initParseContent);
    global_grammar_context.io.prev.addEventListener("click", prev);
    global_grammar_context.io.next.addEventListener("click", printNext);
    document.body.addEventListener("keydown", (e) => {
        if (e.target == global_grammar_context.io.input)
            return;

        switch (e.key) {
            case "ArrowLeft":
                prev();
                break;
            case "ArrowRight":
                printNext();
                break;
            case "PageUp":
                skipBack();
                break;
            case "PageDown":
                skipForward();
                break;
            case " ":
                initParseContent();
                break;
            case "Home":
            case "ArrowUp":
                home();
                break;
            case "End":
            case "ArrowDown":
                end();
                break;
        }
    });
};

function initParseContent() {
    global_grammar_context.parse_context = create_parse_context(
        global_grammar_context.active_entry,
        global_grammar_context.io.input.value
    );
    if (global_grammar_context.parse_context)
        renderState(global_grammar_context);
}

function end() {
    if (global_grammar_context.parse_context) {
        let curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        while (curr.ACTIVE) {
            next();
            curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        }
        renderState(global_grammar_context);
    }
}

function home() {
    if (global_grammar_context.parse_context) {
        global_grammar_context.parse_context.current_state_index = 0;
        renderState(global_grammar_context);
    }
}

function skipForward() {
    if (global_grammar_context.parse_context) {
        next();
        let curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        while (curr.actions.length == 0 && curr.ACTIVE) {
            next();
            curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        }
        renderState(global_grammar_context);
    }
}

function skipBack() {
    if (global_grammar_context.parse_context) {
        prev();
        let curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        while (curr.actions.length == 0 && global_grammar_context.parse_context.current_state_index > 0) {
            prev();
            curr = global_grammar_context.parse_context.states[global_grammar_context.parse_context.current_state_index];
        }
        renderState(global_grammar_context);
    }
}

function prev() {
    if (global_grammar_context.parse_context) {
        const {
            parse_context: {
                current_state_index,
            },
        } = global_grammar_context;

        if (current_state_index > 0) {
            global_grammar_context.parse_context.current_state_index = current_state_index - 1;
            renderState(global_grammar_context);
        }
    }
}


function printNext() {
    next();
    renderState(global_grammar_context);
}

function next() {
    if (global_grammar_context.parse_context) {
        const {
            parse_context: {
                current_state_index, parser, states, stacks, input
            }, production_names } = global_grammar_context;

        let prev_state = states[current_state_index];

        if (prev_state.ACTIVE && current_state_index == states.length - 1) {

            let next_state = parser.next_state(prev_state);

            let stack = stacks[current_state_index].slice();

            stacks.push(stack);

            states.push(next_state);

            global_grammar_context.parse_context.current_state_index = current_state_index + 1;

            for (const action of next_state.actions) {
                switch (action.type) {

                    case ParseActionType.ACCEPT: {
                    } break;

                    case ParseActionType.SHIFT: {
                        const { offset, length } = action;
                        stack.push(input.slice(offset, offset + length));
                    } break;

                    case ParseActionType.SKIP: {
                    } break;

                    case ParseActionType.ERROR: {
                    } break;

                    case ParseActionType.REDUCE: {

                        const { length, production } = action;

                        const sub_stack = stack.slice(-length);

                        stack.length -= length;


                        if (
                            typeof sub_stack[0] != "string"
                            &&
                            sub_stack[0].id == production_names[next_state.production_id]
                        ) {
                            const ele = {
                                id: sub_stack[0].id,
                                stack: sub_stack[0].stack.slice();
                            };

                            stack.push(ele);

                            ele.stack.push(...sub_stack.slice(1));

                            break;
                        }


                        stack.push({
                            id: production_names[next_state.production_id],
                            stack: sub_stack
                        });

                    } break;
                }
            }
        } else if (prev_state.ACTIVE) {
            global_grammar_context.parse_context.current_state_index = current_state_index + 1;
        }
    }
}

function renderState(
    grammar_context: GrammarContext
) {

    const {
        parse_context: {
            input,
            current_state_index,
            stacks,
            states: parse_states
        },
        tokens,
        io: { right, center, left, output }
    } = grammar_context,
        prev_state = parse_states[current_state_index - 1],
        curr_state = parse_states[current_state_index],
        local_offset = prev_state?.tokens[1].codepoint_offset || 0;

    center.innerHTML = createStateElement(curr_state.state, grammar_context);
    right.innerHTML = createStackElement(stacks, current_state_index);
    output.innerHTML = createSliceDiagramString(local_offset, input, length, 40);
    left.innerHTML = createActionElement(curr_state, tokens, input, local_offset);
}

function createActionElement(curr_state: DebugState, tokens: Map<number, string>, input: string, local_offset: number) {

    let temp_text = "<div><h2>Actions</h2>";

    for (const action of curr_state.actions) {
        switch (action.type) {

            case ParseActionType.ACCEPT: {
                temp_text += `<div class=action><div>ACCEPT</div></div>`;
            } break;

            case ParseActionType.SHIFT: {
                const { length, token_type, offset } = action;
                temp_text += `<div class=action>`;
                temp_text += `<div>SHIFT at offset ${offset} tok: [${tokens.get(token_type)}][${token_type}]</div>`;
                temp_text += `<div>[${createSliceDiagramString(offset, input, length)}]</div>`;
                temp_text += `</div>`;
                local_offset += length;
            } break;

            case ParseActionType.SKIP: {
                const { length, token_type, offset } = action;
                temp_text += `<div class=action>`;
                temp_text += `<div>SKIP at offset ${offset} tok: [${tokens.get(token_type) ?? "ignored_symbols"}][${token_type}]</div>`;
                temp_text += `<div>[${createSliceDiagramString(offset, input, length)}]</div>`;
                temp_text += `</div>`;
                local_offset += length;
            } break;

            case ParseActionType.ERROR: {
                const { tk_length, tk_offset, tk_type } = action;
                temp_text += `<div class=action>`;
                temp_text += `<div>ERROR "unexpected character" at offset ${tk_offset} [${input.slice(tk_offset, tk_offset + Math.max(tk_length, 1))}]</div>`;
                temp_text += `</div>`;

            } break;

            case ParseActionType.REDUCE: {
                const { length, body, production } = action;
                temp_text += `<div>`;
                temp_text += `<div>REDUCE ${length} tokens, prod: ${body}, ${production}</div>`;
                temp_text += `</div>`;
            } break;
        }
    }

    return temp_text + "</div>";
}


function sanitize(i: string) {
    return i.replace(/\</g, "&lt;")
        .replace(/\ /g, "<span class=token-space> sp </span>")
        .replace(/\n/g, "<span class=token-newline> nl </span>");
}

function createStackElement(stacks: any[][], current_state_index: number) {
    const stack = stacks[current_state_index];
    let fill = Math.max(0, 20 - stack.length);
    return "<h2> Token Stack </h2> " + stack.map((v, i) => {
        if (typeof v == "string") {
            return `<div class="stack-entry se-active">${createNum(i)} <span class="stack-entry-string">${sanitize(v)}</span> </div>`;
        } else {
            return `<div class="stack-entry se-active">${createNum(i)} <span class="stack-entry-obj">${v.id}</span><div class=stack-entry-obj-details>${createElementDetails(v)}</div> </div>`;
        }
    }).concat((new Array(fill)).fill(1).map(
        (v, i) => `<div class="stack-entry">${createNum(i + stack.length)} <span class="stack-entry-string"></span> </div>`

    )).join(" ");

    function createElementDetails(v: any, depth: number = 0) {
        let str = "<div class=stack-token-diagram>";

        str += `<h1>${v.id}</h1><div class=stack-token-diagram-elements>`;

        for (const val of v.stack) {
            if (typeof val == "string") {
                str += `<div class=stack-token-diagram-string>"${sanitize(val)}"</div>`;
            } else {
                str += createElementDetails(val);
            }
        }


        return str + "</div></div>";
    }

    function createNum(i: number) {
        return `<span class="stack-entry-number">${("00" + i).slice(-3)}</span>`;
    }
}

function createSliceDiagramString(local_offset: number, input: string, len: number = 0, window_size = 20) {
    const off = local_offset;
    const pad = Math.ceil(window_size / 2);
    let str = "";
    if (len == 0) {
        str =
            sanitize(input.slice(Math.max(0, off - pad), off))
            + "<span class=token-highlight>•</span>"
            + sanitize(input.slice(off + len, off + len + pad));
    } else {
        str = sanitize(input.slice(Math.max(0, off - pad), off))
            + "<span class=token-highlight>•"
            + sanitize(input.slice(off, off + len))
            + "•</span>"
            + sanitize(input.slice(off + len, off + len + pad));
    }

    return str;
}

function create_parse_context(
    entry_pointer: number,
    input: string,
): GrammarContext["parse_context"] {
    const reader = new StringByteReader(input);
    const {
        byte_code
    } = global_grammar_context;
    const parser = new DebugIterator(reader, byte_code, entry_pointer);

    return {
        states: [parser.active_debug_state],
        current_state_index: 0,
        input: input,
        stacks: [[]],
        parser: parser
    };
}
function dis_address(count: number) {
    return ("000000000" + ((count & 0xFFFFFF) * 4).toString(16)).slice(-6);
}

function createStateElement(state_index: number, grammar_context: GrammarContext) {
    console.log();

    const {
        parse_context: {
            input,
            current_state_index,
            stacks,
            states: parse_states
        },
        tokens,
        states,
        byte_code,
        io: { right, center }
    } = grammar_context;
    const state = states.get(state_index);

    if (state) {
        const state_name = state.name;
        const pointer = state_index;
        let ip = pointer;
        const labels = [
            (s: ExportableStateData) => (s.pointer & normal_state_mask) ? `<span class="s_label s_label_nm">NORMAL<span>` : "",
            (s: ExportableStateData) => (s.pointer & fail_state_mask) ? `<span class="s_label s_label_fl">FAIL_MODE<span>` : "",
            (s: ExportableStateData) => (s.pointer & goto_state_mask) ? `<span class="s_label s_label_gt">GOTO<span>` : "",
            (s: ExportableStateData) => (s.pointer & scanner_state_mask) ? `<span class="s_label s_label_sc">SCAN<span>` : "",
        ].map(f => f(state)).filter(s => !!s).join(" ");

        let lines = [
            `<div id="${state_name}" class="state">`,
            /**/`<div class="state-header">`,
            /****/`<h2>State ${state_name.replace(/\_+/g, " ").toUpperCase()} </h2>`,
            /****/`<div> Address: <b class="address">${dis_address(state.pointer)}</b> | Bytesize: ${(pointer - ip) << 2} ${labels}</div>`,
            /**/`</div>`,
            /**/`<div class="ir"><h3>Intermediate Representation</h3><pre><code>${state.string}</code></pre></div>`,
            `</div>`
        ];

        return lines.join("\n");
    } else {
        return "<div class=state><h2>State [Unknown]</h2></div>";
    }
}

//@ts-ignore

globalThis["hc_init"] = hc_init;