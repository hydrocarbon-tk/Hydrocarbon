/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Worker } from "worker_threads";
import { LocalWorker } from "../compiler/workers/local_worker";

export type WorkerContainer = {
    target: Worker | LocalWorker;
    id: number;
    READY: boolean;
};
