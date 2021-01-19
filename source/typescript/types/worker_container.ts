import { Worker } from "worker_threads";
import { LocalWorker } from "../compiler/workers/local_worker";

export type WorkerContainer = {
    target: Worker | LocalWorker;
    id: number;
    READY: boolean;
};
