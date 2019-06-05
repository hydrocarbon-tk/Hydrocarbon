import whind from "@candlefw/whind";

import * as hc from "../hydrocarbon.mjs";

import url from "url";
import readline from "readline";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { performance } from "perf_hooks";

const gray_b = "\x1b[48;5;233m";
const grn_b = "\x1b[48;5;100m";
const prpl_b = "\x1b[48;5;57m";
const drk_orng_b = "\x1b[48;5;88m";
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
])

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
])

function getTimeStamp(date_object, USE_MILLISECONDS){
    const div = ":";
    return ("0"+(date_object.getHours()-17)).slice(-2) + div + ("0"+(date_object.getMinutes())).slice(-2) +div+ ("0"+(date_object.getSeconds())).slice(-2) + (USE_MILLISECONDS ? "."+ date_object.getMilliseconds() : "");
}

color_loading_gs = color_loading_gs.concat(color_loading_gs).concat(color_loading_gs);

function colorLoad(length, step, color_array, fill = " ", clear_color = true) {
    const l = color_array.length;
    return color_array.slice(0, length).map((a, i) => color_array[((l - i) + step) % (l)] + fill).join("") + (clear_color ? "\x1b[0m" : "");
}

function center(string) {
    const fill = " ";
    const length = string.replace(/\x1b[^m]*m/g, "").length;
    const col = process.stdout.columns

    return fill.repeat(Math.max(0, Math.round(col / 2 - length / 2))) + string;
}

async function runner(grammar, env_path, name, UNATTENDED = false) {

    if(!grammar)
        throw new Error(`Unable to parse grammar, the grammar is ${grammar}`);

    const start = performance.now();

    let loop = 0;

    return (new Promise((res) => {

        let
            COMPLETE = false,
            EXIT = false,
            completion_ratio = 0,
            items_left = 0,
            total_items_processed = 0,
            number_of_states = 0,
            conflicts_generated = 0,
            states = null,
            error,
            conflict_number = -1,
            time = new Date(performance.now() - start);;

        let worker;

        if(process.platform == "win32"){
            worker = new Worker(import.meta.url.replace(/file\:\/\/\//g,""), 
            {
                workerData: { grammar, env_path }
            })
        }else{
            worker = new Worker((new URL(import.meta.url)).pathname, 
            {
                workerData: { grammar, env_path }
            })
        }

        worker.on("message", (e, d) => {
            completion_ratio = e.completion_ratio;
            items_left = e.items_left;
            total_items_processed = e.total_items_processed;
            number_of_states = e.number_of_states;
            completion_ratio = e.completion_ratio;
            conflicts_generated = e.conflicts_generated;
            error = e.error;

            if (e.completed == true) {
                COMPLETE = true;
                states = e.states;
                time = new Date(performance.now() - start);
            }
            if(UNATTENDED)
                test()
        })

        const stdin = process.stdin;

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        stdin.on('data', function(key) {
            const keypress = key.charCodeAt(2) | key.charCodeAt(1) << 8 | key.charCodeAt(0) << 16

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
                    console.log("ctr-c pressed. Exiting")
                    console.clear();
                    return process.exit();
                case 1769472:
                    EXIT = true;
                    break;
            }

            return key;
        });

        function test() {
            console.clear();
            // Clearing console to provide a dashboard interface.
            if(!UNATTENDED) console.clear();

            if (COMPLETE && (EXIT || UNATTENDED)) {
                if(id)
                    clearInterval(id);

                error.strings.forEach(str=>console.log(str));
                res(states);
                return;
            } else if (!COMPLETE) {
                loop++;
                time = new Date(performance.now() - start);
            }

            let conflicts = "";

            const
                col = process.stdout.columns,
                completion_ratio_bar_size = Math.max(25, col - 50),
                p = colorLoad(4, loop, color_loading),
                clear = "\x1b[0m",
                d = "\x1b[48;5;53m",
                num = "\x1b[48;5;53m",
                c = Math.round(completion_ratio_bar_size * completion_ratio),
                r = (completion_ratio_bar_size - c) > 0 ? colorLoad(completion_ratio_bar_size - c, loop, color_loading_gs, " ", false) : "";

            if (conflicts_generated > 0) {
                if (conflict_number > -1) {
                    const conflict_tabs_header = `${-1 < conflict_number ? "<" : " " }     Conflict ${ conflict_number + 1 }     ${ conflict_number < conflicts_generated-1 ? ">" : " " }`;
                    const conflict_tabs = Array.apply(null, Array(conflicts_generated)).map((a, i) => i == conflict_number ? "o" : "O").join("        ")
                    conflicts = `${center(conflict_tabs_header)}\n${center(conflict_tabs)}\n${error.strings[conflict_number]}`
                } else
                    conflicts = center(`${COLOR_ERROR}Use arrow keys to review conflicts. > ${COLOR_RESET}`)
            }

            if(!UNATTENDED)
                console.log(
                    ["CFW Hydrocarbon - Compiling " + name + " grammar", "",
                        ` Elapsed Time ${getTimeStamp(time, COMPLETE)}`, "",
                        ` ${p} Completion Ratio:    ${prpl_b}${(" ").repeat(c)}${r}${(Math.round(completion_ratio*10000)*0.01).toFixed(2)}%`,
                        ` ${p} Total Items:         ${gray_b}${(("               ")+total_items_processed).slice(-8)}`,
                        ` ${p} Pending Items:       ${gray_b}${(("               ")+items_left).slice(-8)}`,
                        ` ${p} Number Of States:    ${gray_b}${(("               ")+number_of_states).slice(-8)}`,
                        ` ${p} Conflicts Generated: ${gray_b}${conflicts_generated ? red_f : ""}${(("               ")+conflicts_generated).slice(-8)}`, "",
                        center(`${(EXIT && !COMPLETE) ? `Exit primed. Compiling will exit on completion.`: ""}${COMPLETE ? `${ !states.COMPILED ? `${COLOR_ERROR}Compilation failed.`:`${COLOR_SUCCESS}Compilation complete.`}${COLOR_RESET} Press ${COLOR_KEYBOARD}esc${COLOR_RESET} to end this step.${COLOR_RESET}`: ""}`), "",
                        conflicts
                    ].join(clear + "\n"));
            else {

                process.stdout.clearLine();
                process.stdout.cursorTo(0); 
                console.log("tick:", getTimeStamp(time, true),  "number of states:", number_of_states);
            }
        }

        var id = setInterval(test, 200)
    }))
}

if (!isMainThread) {

    async function loadEnv(env_path) {
        let env = { functions: {} };

        //check for optional env file
        if (env_path) {
            let ext = env_path.split(".").reverse()[0];

            env = (await import("file://"+env_path)).default; // WyTF is file:// a thing !?!?!
        }


        return env;
    }


    async function runner() {
        const { grammar, env_path } = workerData;

        let env = null;

        try {
            env = await loadEnv(env_path)
        } catch (e) {
            parentPort.postMessage({
                error: { strings: [e.toString()] },
                conflicts_generated: 1,
                completion_ratio: 0,
                items_left: 0,
                total_items_processed: 0,
                number_of_states: 0,
                completed: true,
                states: { COMPILED: false }
            });

            process.exit();
        }


        let gen = hc.compileLRStates(grammar, env);
        let status = gen.next().value;
        let number_of_completed_items = 0;
        let loop = 0;
        let completion_ratio = 0
        let items_left = 0
        let total_items_processed = 0
        let number_of_states = 0
        let conflicts_generated = 0

        do {
            completion_ratio = ((status.total_items - status.items_left) / status.total_items);
            items_left = status.items_left;
            total_items_processed = loop++;
            number_of_states = status.num_of_states;
            conflicts_generated = status.error.strings.length;



            parentPort.postMessage({
                error: status.error,
                conflicts_generated,
                completion_ratio,
                items_left,
                total_items_processed,
                number_of_states,
                completed: false,
                states: null
            });

            status = gen.next().value;
        } while (!status.COMPLETE)

        const states = status.states;


        parentPort.postMessage({
            error: status.error,
            conflicts_generated,
            completion_ratio,
            items_left,
            total_items_processed,
            number_of_states,
            completed: true,
            states
        });
    }

    runner();
    //Load environment object
}

export default runner;
