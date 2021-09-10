/**
 * Simple Logging Class
 */

export enum LogLevel {
    THROW,
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

export class Logger {

    deactivate() {
        this.ACTIVE = false;
    }

    log(...args) {
        if (this.ACTIVE)
            console.log(this.name + ":", ...args);
    }

    static get(name: string): Logger {
        return Logger.createLogger(name);
    }

    static createLogger(name: string): Logger {
        if (!Logger.logs.has(name))
            Logger.logs.set(name, new Logger(name));
        return Logger.logs.get(name);
    }
    constructor(name) {
        this.name = name;
        this.ACTIVE = true;
    }

    static logs = new Map;

    ACTIVE: boolean;

    name: string;
}
