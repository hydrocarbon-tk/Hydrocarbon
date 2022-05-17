import {
    GeneralProductionNode, GrammarObject, HCG3Symbol, ProductionTokenSymbol,
    ScannerProductionNode,
    SymbolType,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined,
    Sym_Is_Empty, Sym_Is_DEFAULT
} from "@hctoolkit/common";
import { loadGrammarFromString } from "./load.js";

function convertSymbolsToProductionName(name: string) {
    const output = [];

    for (const char of name) {

        const cp = +(<any>char.codePointAt(0));

        if ((cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90)) {
            output.push(char);
        } else if ((cp >= 48 && cp <= 57)) {
            output.push(`_${char}`);
        } else {
            output.push(`_${cp}`);
        }
    }

    return output.join("");
}

export function getSymbolProductionName(sym: HCG3Symbol) {
    if (Sym_Is_A_Generic_Type(sym)) {
        return `__clss_${convertSymbolsToProductionName(sym.val)}__`;
    } else if ((Sym_Is_Defined(sym) &&
        !(Sym_Is_Empty(sym) || Sym_Is_DEFAULT(sym)))) {
        return `__defined_${convertSymbolsToProductionName(sym.val)}__`;
    } else if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
        return `__prod_${sym?.production?.name ?? "undefined"}__`;
    }

    return "";
}
export function buildScannerProduction(grammar: GrammarObject) {

    const productions: ScannerProductionNode[] = [], root_productions = [], seen = new Set();

    for (const [name, sym] of grammar?.meta?.all_symbols ?? []) {

        if (!Sym_Is_A_Production(sym)) {
            if (Sym_Is_A_Generic_Type(sym)) {
                //* 
                if (sym.type == SymbolType.DEFAULT || sym.val == "rec")
                    continue;
                const val = sym.val;
                const name = getSymbolProductionName(sym);
                if (["nums", "ids", "syms"].includes(val)) {
                    root_productions.push(
                        <ScannerProductionNode>addRootScannerFunction(`<> ${name} > g:${val.slice(0, -1)}  | ${name} g:${val.slice(0, -1)}\n`, sym.id)
                    );
                } else {
                    root_productions.push(
                        <ScannerProductionNode>addRootScannerFunction(`<> ${name} > g:${val}\n`, sym.id)
                    );
                } //*/
            } else if (Sym_Is_A_Production_Token(sym)) {

                let prods: [ProductionTokenSymbol, GeneralProductionNode][] = [[sym, sym.production]];

                let root = true;

                for (const [sym, production] of prods) {
                    if (!production)
                        debugger;

                    const name = getSymbolProductionName(sym);

                    if (seen.has(name))
                        continue;

                    seen.add(name);

                    const bodies = [];

                    for (const body of production.bodies) {

                        let str = [];

                        for (const sym of body.sym) {
                            if (Sym_Is_A_Generic_Type(sym)) {
                                if (Sym_Is_DEFAULT(sym))
                                    continue;
                                str.push(`g:${sym.val}`);
                            } else if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                                str.push(getSymbolProductionName(sym));
                                prods.push([sym, sym.production]);
                            } else if (Sym_Is_Defined(sym)) {
                                const val = sym.val;
                                const syms = val.split("");
                                str.push(...syms.map(s => `\\${s} `));
                            }
                        }

                        if (str.length > 0)
                            bodies.push(str.join(" "));
                    }
                    if (root) {
                        root = false;
                        root_productions.push(addRootScannerFunction(`<> ${name} > ${bodies.join(" | ")}\n`, sym?.id ?? 0));
                    }
                    else
                        productions.push(addRootScannerFunction(`<> ${name} > ${bodies.join(" | ")}\n`, sym?.id ?? 0));
                }

            } else if (Sym_Is_Defined(sym) &&
                !(Sym_Is_Empty(sym) || Sym_Is_DEFAULT(sym))) {

                const name = getSymbolProductionName(sym);;

                const val = sym.val;

                const syms = val.split("");

                root_productions.push(
                    <ScannerProductionNode>addRootScannerFunction(`<> ${name} > ${syms.map((s: string) => `\\${s} `).join(" ")}\n`, sym?.id ?? 0)
                );
            }
        }
    }

    for (const production of [...productions, ...root_productions]) {
        production.name = production.symbol.name;
        production.type = "scanner-production";
    }

    grammar.productions.push(...root_productions, ...productions);
}

export function addRootScannerFunction(val: string, token_id: number): ScannerProductionNode {

    const production = <ScannerProductionNode>loadGrammarFromString(val).productions[0];

    production.token_id = token_id;

    production.type = "scanner-production";

    return production;
}
