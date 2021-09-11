/**
 * Simple Logging Class
 */

export enum LogLevel {
    THROW = 1 << 0,
    ERROR = 1 << 1,
    WARN = 1 << 2,
    INFO = 1 << 3,
    DEBUG = 1 << 4,
}

export class Logger {
    static get(name: string): Logger {
        return Logger.createLogger(name);
    }

    static createLogger(name: string): Logger {
        if (!Logger.logs.has(name))
            Logger.logs.set(name, new Logger(name));
        return Logger.logs.get(name);
    }

    deactivate(log_level: LogLevel = LogLevel.THROW | LogLevel.ERROR | LogLevel.WARN | LogLevel.DEBUG | LogLevel.INFO) {

        this.ACTIVE ^= log_level;

        for (const child of this.children)
            child.deactivate(log_level);
    }

    activate(log_level: LogLevel = LogLevel.THROW | LogLevel.ERROR | LogLevel.WARN | LogLevel.DEBUG | LogLevel.INFO) {

        this.ACTIVE |= log_level;

        for (const child of this.children)
            child.activate(log_level);
    }

    log(...args) {
        if (this.ACTIVE & LogLevel.INFO)
            console.log(this.render_name + ":", ...args);
    }

    error(...args) {
        if (this.ACTIVE & LogLevel.ERROR)
            console.error(this.render_name + ":", ...args);
    }

    warn(...args) {
        if (this.ACTIVE & LogLevel.WARN)
            console.warn(this.render_name + ":", ...args);
    }

    debug(...args) {
        if (this.ACTIVE & LogLevel.DEBUG)
            console.log(this.render_name + ":", ...args);
    }

    get name() {
        return this._name;
    }

    set name(name: string) {

        this._name = name;

        this.update_name();
    }

    createLogger(name: string) {

        const child_logger = Logger.createLogger(this.base_name + "-" + name);

        if (!child_logger.parent) {
            this.children.push(child_logger);
            child_logger._name = name;
            child_logger.parent = this;
            child_logger.update_name();
        }

        return child_logger;
    }

    get(name: string) {
        return this.createLogger(name);
    }

    constructor(name) {
        this._name = name;
        this.base_name = name;
        this.render_name = name;
        this.children = [];
        this.parent = null;
        this.ACTIVE = LogLevel.THROW | LogLevel.ERROR | LogLevel.WARN | LogLevel.DEBUG | LogLevel.INFO;
    }
    private update_name() {
        this.render_name = (this?.parent?.render_name ? this?.parent?.render_name + "-" : "") + this._name;
        for (const child of this.children)
            child.update_name();
    }

    static logs = new Map;

    readonly base_name: string;

    render_name: string;

    parent: Logger;

    ACTIVE: LogLevel;

    _name: string;

    children: Logger[];
}
