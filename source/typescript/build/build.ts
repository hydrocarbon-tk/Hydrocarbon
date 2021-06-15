import spark from "@candlelib/spark";
import { constructCompilerRunner, Helper } from "../build/helper.js";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
export async function buildRecognizer(
    grammar: HCG3Grammar,
    number_of_workers: number = 1,
    ADD_ANNOTATIONS: boolean = false
): Promise<{
    recognizer_functions: RDProductionFunction[];
    meta: Helper;
}> {

    const
        runner: Helper = constructCompilerRunner(ADD_ANNOTATIONS, false),

        mt_code_compiler = new WorkerRunner(grammar, runner, number_of_workers);

    for (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    return {
        recognizer_functions: mt_code_compiler.functions,
        meta: runner
    };
}
