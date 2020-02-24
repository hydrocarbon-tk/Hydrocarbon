import * as hc from "../hydrocarbon.mjs";

import { performance } from "perf_hooks";

//import cli from "@candlefw/wick.cli"

const gray_b = "\x1b[48;5;233m";
const prpl_b = "\x1b[48;5;57m";
const red_f = "\x1b[38;5;196m";
const COLOR_ERROR = `\x1b[41m`,
    COLOR_KEYBOARD = `\x1b[38;5;15m\x1b[48;5;246m`,
    COLOR_SUCCESS = `\x1b[38;5;254m\x1b[48;5;30m`,
    COLOR_RESET = `\x1b[0m`;

const color_loading = ([
    "\x1b[48;5;53m",
    "\x1b[48;5;54m",
    "\x1b[48;5;55m",
    "\x1b[48;5;56m",
    "\x1b[48;5;57m",
    "\x1b[48;5;57m",
    "\x1b[48;5;57m",
    "\x1b[48;5;56m",
    "\x1b[48;5;55m",
    "\x1b[48;5;54m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;54m",
    "\x1b[48;5;55m",
    "\x1b[48;5;56m",
    "\x1b[48;5;57m",
    "\x1b[48;5;57m",
    "\x1b[48;5;57m",
    "\x1b[48;5;56m",
    "\x1b[48;5;55m",
    "\x1b[48;5;54m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
    "\x1b[48;5;53m",
]);

let color_loading_gs = ([
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;234m",
    "\x1b[48;5;234m",
    "\x1b[48;5;235m",
    "\x1b[48;5;235m",
    "\x1b[48;5;236m",
    "\x1b[48;5;236m",
    "\x1b[48;5;236m",
    "\x1b[48;5;237m",
    "\x1b[48;5;237m",
    "\x1b[48;5;237m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;238m",
    "\x1b[48;5;237m",
    "\x1b[48;5;237m",
    "\x1b[48;5;237m",
    "\x1b[48;5;236m",
    "\x1b[48;5;236m",
    "\x1b[48;5;236m",
    "\x1b[48;5;235m",
    "\x1b[48;5;235m",
    "\x1b[48;5;234m",
    "\x1b[48;5;234m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
    "\x1b[48;5;233m",
]);

function getTimeStamp(date_object, USE_MILLISECONDS) {
    const div = ":";
    return ("0" + (date_object.getHours() - 17)).slice(-2) + div + ("0" + (date_object.getMinutes())).slice(-2) + div + ("0" + (date_object.getSeconds())).slice(-2) + (USE_MILLISECONDS ? "." + date_object.getMilliseconds() : "");
}

color_loading_gs = color_loading_gs.concat(color_loading_gs).concat(color_loading_gs);

function colorLoad(length, step, color_array, fill = " ", clear_color = true) {
    const l = color_array.length;
    return color_array.slice(0, length).map((a, i) => color_array[((l - i) + step) % (l)] + fill).join("") + (clear_color ? "\x1b[0m" : "");
}

function center(string) {
    const fill = " ";
    const length = string.replace(/\x1b[^m]*m/g, "").length;
    const col = process.stdout.columns;

    return fill.repeat(Math.max(0, Math.round(col / 2 - length / 2))) + string;
}

async function runner(grammar, env, env_path, name, GLR = false, UNATTENDED = false) {
    return new Promise(res => {

        if (!grammar)
            throw new Error(`Unable to parse grammar, the grammar is ${grammar}`);

        const
            gen = hc[GLR ? "compileGLRStatesMT" : "compileLRStatesMT"](grammar, env, env_path),
            start = performance.now(),
            stdin = process.stdin;

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        let
            EXIT = false,
            completion_ratio = 0,
            items_left = 0,
            total_items_processed = 0,
            number_of_states = 0,
            conflicts_generated = 0,
            error,
            conflict_number = -1,
            time = new Date(performance.now() - start),
            loop = 0,
            states = null,
            status = gen.next().value;

        if (status.COMPLETE) //FAILURE
            res(status.states);

         function onKeyEvent(key) {
            const keypress = key.charCodeAt(2) | key.charCodeAt(1) << 8 | key.charCodeAt(0) << 16;

            switch (keypress) {
                case 1792836: // Left Arrow
                    if (conflict_number > -1)
                        conflict_number--;
                    break;
                case 1792835: //Right Arraow
                    if (conflict_number < conflicts_generated - 1)
                        conflict_number++;
                    break;
                case 196608:
                    console.log("ctr-c pressed. Exiting");
                    console.clear();
                    return process.exit();
                case 1769472:
                    EXIT = true;
                    break;
            }

            run();

            return key;
        };

        stdin.on('data',onKeyEvent);

        let render_time = 0;

        async function run() {
            const iter = gen.next();

            if (iter.value)
                status = iter.value;


            completion_ratio = ((status.total_items - status.items_left) / status.total_items);
            items_left = status.items_left;
            error = status.errors;
            states = status.states;
            total_items_processed = status.total_items;
            number_of_states = status.num_of_states;
            conflicts_generated = error.strings.length;


            if ((render_time++ % (!UNATTENDED ? 120 : 200)) == 0 || status.COMPLETE) {

                if (!UNATTENDED) console.clear();

                let conflicts = "";

                const
                    col = process.stdout.columns,
                    completion_ratio_bar_size = Math.max(25, col - 50),
                    p = colorLoad(4, loop, color_loading),
                    clear = "\x1b[0m",
                    c = Math.round(completion_ratio_bar_size * completion_ratio),
                    r = (completion_ratio_bar_size - c) > 0 ? colorLoad(completion_ratio_bar_size - c, loop, color_loading_gs, " ", false) : "";

                if (conflicts_generated > 0) {
                    if (conflict_number > -1) {
                        const conflict_tabs_header = `${-1 < conflict_number ? "🡄" : " " }     Conflict ${ conflict_number + 1 }     ${ conflict_number < conflicts_generated-1 ? "🡆" : " " }`;
                        const conflict_tabs = Array.apply(null, Array(conflicts_generated)).map((a, i) => i == conflict_number ? "🌑" : "🌕").join("");
                        conflicts = `${center(conflict_tabs_header)}\n${center(conflict_tabs)}\n\n${error.strings[conflict_number]}`;
                    } else
                        conflicts = center(`${COLOR_ERROR} Use arrow keys to review conflicts. 🡆 ${COLOR_RESET}`);
                }

                if (!UNATTENDED) {

                    console.log(
                    ["CFW Hydrocarbon - Compiling " + name + " grammar", "",
                        ` Elapsed Time ${getTimeStamp(time, status.COMPLETE)}`, "",
                        ` ${p} Completion Ratio:    ${prpl_b}${(" ").repeat(c)}${r}${(Math.round(completion_ratio*10000)*0.01).toFixed(2)}%`,
                        ` ${p} Total Items:         ${gray_b}${(("               ")+total_items_processed).slice(-8)}`,
                        ` ${p} Pending Items:       ${gray_b}${(("               ")+items_left).slice(-8)}`,
                        ` ${p} Number Of States:    ${gray_b}${(("               ")+number_of_states).slice(-8)}`,
                        ` ${p} Conflicts Generated: ${gray_b}${conflicts_generated ? red_f : ""}${(("               ")+conflicts_generated).slice(-8)}`, "",
                        center(`${(EXIT && !status.COMPLETE) ? `Exit primed. Compiling will exit on completion.`: ""}${status.COMPLETE ? `${ !states.COMPILED ? `${COLOR_ERROR}Compilation failed.`:`${COLOR_SUCCESS}Compilation complete.`}${COLOR_RESET} Press ${COLOR_KEYBOARD}esc${COLOR_RESET} to end this step.${COLOR_RESET}`: ""}`), "",
                        conflicts
                    ].join(clear + "\n"));
                } else {

                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    console.log("tick:", getTimeStamp(time, true), "number of states:", number_of_states);
                }
            }

            if (status.COMPLETE) {

                if (runner_id) {
                    clearInterval(runner_id);
                    runner_id = null;
                }

                if ((EXIT || UNATTENDED)) {
                    stdin.removeListener('data',onKeyEvent);
                    error.strings.forEach(str => console.log(str));
                    return res(status.states);
                }
            } else if (!status.COMPLETE) {
                loop++;
                time = new Date(performance.now() - start);
            }
        }

        var runner_id = setInterval(run, 1);
    });
}

export default runner;