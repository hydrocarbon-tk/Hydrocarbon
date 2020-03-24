/**
 * Return value of the parser.
 * 
 * Includes parser meta data.
 * 
 */
export interface ParserResultData<T> {
    /**
     * First object off the output stack
     */
    value: T;
    /**
     * Error message if parse failed to parser the input.
     */
    error: string;
    /**
     * Number of cycles taken to get the result
     */
    cycles: number;
    /**
     * Total number of cycles taken in all forked paths
     */
    total_cycles: number;
    /**
     *
     */
    off: number;
    /**
     * Number of forks closures to get to the result or error
     */
    fork_depth: number;
    /**
     * cycles devided by total_cycles
     */
    efficiency: number;
}
