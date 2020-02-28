
/**
 * Defines custom function handlers and options for lrParser
 */
export interface ParserEnvironment {
    functions?: {
        defaultError?:()=>number;
        /**
         * Functions used within the lr_parser to handle REDUCE, SHIFT, and ACCEPT
         * actions. 
         */
    };
    /**
     * Proxy of functions
     */
    fn?: {};
    /**
     * List of options that affect how the grammar is compiled. 
     */
    options?:{
        /**
         * If true functions defined in the environment object will be compiled into 
         * the ParserData.
         */
        integrate?:boolean
    }
}
