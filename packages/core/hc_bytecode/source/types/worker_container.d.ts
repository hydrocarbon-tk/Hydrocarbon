/// <reference types="@types/node" />
import { Worker } from "worker_threads";
import { LocalWorker } from "../build/workers/local_worker";
export declare type WorkerContainer = {
    target: Worker | LocalWorker;
    id: number;
    time: number;
    READY: boolean;
};
