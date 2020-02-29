import { ProductionBody, Grammar, Symbol, SymbolType } from "../types/grammar.js";
export declare function SymbolToString(sym: {
    type?: SymbolType;
    val: string;
}): string;
export declare class Item extends Array {
    static fromArray(array: Item): Item;
    USED: boolean;
    follow: Symbol;
    constructor(body_id: number, length: number, offset: number, follow: Symbol);
    get atEND(): boolean;
    get v(): string | number;
    get p(): number;
    get id(): string;
    get full_id(): string;
    get body(): number;
    get len(): number;
    get offset(): number;
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
