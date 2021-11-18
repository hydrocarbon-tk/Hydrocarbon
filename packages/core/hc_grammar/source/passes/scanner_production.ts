import {
    GeneralProductionNode, GrammarObject, HCG3Symbol, ProductionTokenSymbol,
    ScannerProductionNode,
    SymbolType,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined,
    Sym_Is_Empty, Sym_Is_EOF
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
    if (Sym_Is_A_Generic_Type(sym) || (Sym_Is_Defined(sym) &&
        !(Sym_Is_Empty(sym) || Sym_Is_EOF(sym)))) {
        return `__${convertSymbolsToProductionName(sym.val)}__`;
    } else if (Sym_Is_A_Production_Token(sym)) {
        return `__${sym?.production?.name ?? "undefined"}__`;
    }

    return "";
}
export function buildScannerProduction(grammar: GrammarObject) {

    const productions: ScannerProductionNode[] = [], root_productions = [], seen = new Set();

    const cName = convertSymbolsToProductionName;

    for (const [name, sym] of grammar?.meta?.all_symbols ?? []) {

        if (!Sym_Is_A_Production(sym)) {
            if (Sym_Is_A_Generic_Type(sym)) {
                //* 
                if (sym.type == SymbolType.END_OF_FILE || sym.val == "rec")
                    continue;
                const val = sym.val;
                const name = `__${cName(val)}__`;
                if (["nums", "ids"].includes(val)) {
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

                    const name = `__${production.name}__`;

                    if (seen.has(name))
                        continue;

                    seen.add(name);

                    const bodies = [];

                    for (const body of production.bodies) {

                        let str = [];

                        for (const sym of body.sym) {
                            if (Sym_Is_A_Generic_Type(sym)) {
                                if (Sym_Is_EOF(sym))
                                    continue;
                                str.push(`g:${sym.val}`);
                            } else if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                                const name = sym.name;
                                str.push(`__${name}__`);
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
                !(Sym_Is_Empty(sym) || Sym_Is_EOF(sym))) {

                const val = sym.val;
                const name = `__${cName(val)}__`;

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
