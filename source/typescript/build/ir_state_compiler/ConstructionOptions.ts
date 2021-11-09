import { GrammarProduction, TokenSymbol } from '../../types/index.js';

export interface ConstructionOptions {
    production: GrammarProduction;
    scope: "REDUCE" | "GOTO";
    IS_LAZY: boolean;
    lazy_start_sym?: TokenSymbol;
    lazy_end_sym?: TokenSymbol;
    IS_SCANNER: boolean;
    IS_ROOT_SCANNER: boolean;
    LOCAL_HAVE_ROOT_PRODUCTION_GOTO: boolean;
}
