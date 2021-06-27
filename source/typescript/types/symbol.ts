/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3EmptySymbol, HCG3EOFSymbol, HCG3EOPSymbol, HCG3GeneratedSymbol, HCG3LiteralSymbol, HCG3ProductionSymbol, HCG3ProductionTokenSymbol } from "./grammar_nodes";


export interface DefinedNumericSymbol extends HCG3LiteralSymbol { }

export interface DefinedIdentifierSymbol extends HCG3LiteralSymbol { }

export interface DefinedCharacterSymbol extends HCG3LiteralSymbol { }

export interface GeneratedSymbol extends HCG3GeneratedSymbol { }

export interface EOFSymbol extends HCG3EOFSymbol { }

export interface ProductionSymbol extends HCG3ProductionSymbol { }

export interface ProductionTokenSymbol extends HCG3ProductionTokenSymbol {
    name: string;
    val: number;

}
/**
 * Any symbol that is not a ProductionSymbol, ProductionTokenSymbol, AssertionFunctionSymbol, or GeneratedSymbol.
 * 
 * Specifically, any symbol that is comprised of a discrete sequence of characters
 * defined by the grammar author.
 */
export type DefinedSymbol =
    | DefinedCharacterSymbol
    | DefinedIdentifierSymbol
    | DefinedNumericSymbol;
export type TokenSymbol =
    | DefinedSymbol
    | HCG3GeneratedSymbol
    | HCG3EOFSymbol
    | HCG3EOPSymbol
    | HCG3EmptySymbol
    //| AssertionFunctionSymbol
    | HCG3ProductionTokenSymbol;

export type Symbol = TokenSymbol | HCG3ProductionSymbol;