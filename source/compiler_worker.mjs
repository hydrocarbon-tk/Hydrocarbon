import * as hc from "./hydrocarbon.mjs";
import whind from "@candlefw/whind";
import url from "url";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import readline from "readline";

const loop_animation = ["|", "/", "-", "\\"]

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

async function runner(grammar, env, name) {

    let loop = 0;

    return (new Promise((res) => {

		let keypress = 0;
    	const stdin = process.stdin;
			stdin.setRawMode(true);
			stdin.resume();
			stdin.setEncoding('utf8');
        const worker = new Worker((new URL(
            import.meta.url)).pathname, {
            workerData: { grammar, env }
        })

        let COMPLETE = false,
            completion_ratio = 0,
            items_left = 0,
            total_items_processed = 0,
            number_of_states = 0,
            conflicts_generated = 0,
            states = null,
            error;

        worker.on("message", (e, d) => {
            completion_ratio = e.completion_ratio;
            items_left = e.items_left;
            total_items_processed = e.total_items_processed;
            number_of_states = e.number_of_states;
            completion_ratio = e.completion_ratio;
            conflicts_generated = e.conflicts_generated;
            error = e.error;

            if (e.completed)
                states = e.states;
        })

        const completion_ratio_bar_size = 50;
        let last_input = "", conflict_number = -1;

        stdin.on('data', function(key){
			switch(key.charCodeAt(2)){
				case 68: // Left Arrow
					conflict_number--;
				break;
				case 67: //Right Arraow
					conflict_number++;
				break; 
			}

			return key;
		});

        let id = setInterval(function test() {

            if (states) {
                clearInterval(id);
                res(states);
            }

        	loop++;
        	const p = color_loading.slice(0,4).map((a,i)=> color_loading[((color_loading.length-i) + loop) % (color_loading.length)] + " ").join("") + "\x1b[0m";
            const clear = "\x1b[0m", d = "\x1b[48;5;53m", num = "\x1b[48;5;53m";

             let c = Math.round(completion_ratio_bar_size * completion_ratio);
            let r = completion_ratio_bar_size - c, conflicts ="";

            if(conflicts_generated > 0){
            	if(conflict_number > -1)
            		conflicts = 
`Showing Conflict ${conflict_number + 1}
${error.strings[conflict_number]}`
            	else
            		conflicts = "Enter use arrow keys to reveal conflicts"
            }

            console.clear();
			console.log(
`CFW Hydrocarbon - Compiling
${keypress}
${p} Completion Ratio:    ${d}${("#").repeat(c)}${("*").repeat(r)}${clear}${d} ${Math.round(completion_ratio*10000)*0.01}%
${p} Total Items:         ${num}${total_items_processed}${clear}
${p} Pending Items:       ${num}${items_left}${clear}
${p} Number Of States:    ${num}${number_of_states}${clear}
${p} Conflicts Generated: ${num}${conflicts_generated}${clear}
${(new Array(conflicts_generated)).map((a,i)=>i == conflict_number ? "o" : "O").join(" ")}
${conflicts}
`
			)
        }, 200)
    }))
}

if (!isMainThread) {
    const { grammar, env } = workerData;
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
        	error:status.error,
            conflicts_generated,
            completion_ratio,
            items_left,
            total_items_processed,
            number_of_states,
            completed: false,
            states:null
        });

        status = gen.next().value;
    } while (!status.COMPLETE)

    const states = status.states;

    parentPort.postMessage({
    	error:status.error,
        conflicts_generated,
        completion_ratio,
        items_left,
        total_items_processed,
        number_of_states,
        completed: true,
        states
    });

}

export default runner;