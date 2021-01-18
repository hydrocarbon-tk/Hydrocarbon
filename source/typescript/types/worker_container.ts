import { Worker } from "worker_threads";

export type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};
