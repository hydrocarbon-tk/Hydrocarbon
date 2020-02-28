import { ProductionBody, Grammar, Symbol } from "../types/grammar";
export declare function SymbolToString(sym: Symbol): string;
export declare class Item extends Array {
    static fromArray(array: Item): Item;
    USED: boolean;
    follow: Symbol;
    constructor(body_id: number, length: number, offset: number, follow: Symbol);
    get atEND(): boolean;
    get v(): string | number;
    get p(): any;
    get id(): string;
    get full_id(): string;
    get body(): any;
    get len(): any;
    get offset(): any;
    body_(grammar: Grammar): ProductionBody;
    sym(grammar: Grammar): Symbol;
    render(grammar: Grammar): string;
    renderWithProduction(grammar: Grammar): string;
    renderWithProductionAndFollow(grammar: Grammar): string;
    renderProductionName(grammar: Grammar): string;
    renderProductionNameWithBackground(grammar: any): string;
    renderSymbol(grammar: Grammar): string;
    increment(): Item | null;
    match(item: Item): boolean;
    toString(): string;
}
