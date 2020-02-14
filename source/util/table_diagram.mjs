//Creates a state table diagram for diognostic purposes
//Outputs string containing table value
const crs = String.fromCharCode(0x254B);
const crt = String.fromCharCode(0x2533);
const crb = String.fromCharCode(0x253B);
const crl = String.fromCharCode(0x2523);
//const crr = String.fromCharCode(0x252B);
const hrz = String.fromCharCode(0x2501);
const ver = String.fromCharCode(0x2503);
const crtl = String.fromCharCode(0x250F);
const crtr = String.fromCharCode(0x2513);
const crbr = String.fromCharCode(0x251B);
const crbl = String.fromCharCode(0x2517);
//import util from "util";

import { filloutGrammar } from "./common.mjs";

export function renderTable(states, grammar, tab = "   ", tab_s = tab.length) {

    //Build new env variables if they are missing 
    if (!grammar.bodies) {
        filloutGrammar(grammar, { functions: {} });
    }

    const ws = (count) => (" ").repeat(count),
        tnts = (h) => ((Math.ceil((h + 0.5) / tab_s) * tab_s) - h),
        stnts = (h) => ws(tnts(h)),
        rule_table = states;

    if (rule_table.INVALID) {
        console.error("Invalid state set passed. Cannot continue.");
        return;
    }

    const
        num_states = rule_table.length,
        symbols = new Map(),
        prods = new Map(),
        preps = [];

    let
        max_body = 0,
        symbol_count = 0,
        prod_count = 0,
        str = "";

    /****** Preperation ********/

    for (let i = 0; i < num_states; i++) {
        const
            state = rule_table[i],
            prep = { action: [], goto: [] };

        max_body = Math.max(max_body, state.production_string.length);

        state.action.forEach((v, k) => {

            if (!symbols.has(k)) {
                symbols.set(k, symbol_count++);
            }

            prep.action.push({ k, v, off: symbols.get(k) });
        });

        state.goto.forEach((v, k) => {

            if (!prods.has(k)) {
                prods.set(k, prod_count++);
            }

            prep.goto.push({ k, v: v.state, off: prods.get(k) });
        });


        prep.action.sort((a, b) => a.off < b.off ? -1 : 0);
        prep.goto.sort((a, b) => a.off < b.off ? -1 : 0);

        preps.push(prep);
    }
    /***** Top Bar ********/
    let tm = tab_s - 1;

    str += `${crtl}${hrz.repeat(tm)}${crt}${hrz.repeat(symbol_count * tab_s + tm)}${crt}${hrz.repeat(prod_count * tab_s + tm)}${crtr}\n`

    /***** Header ********/
    let state_len = (tab_s > 7) ? 7 : (tab_s > 5) ? 5 : 3;
    let state = (tab_s > 7) ? "State" : (tab_s > 5) ? "St." : "S";

    let d = `${ver} ${state + stnts(state_len) + ver + ws(tm)}`;
    let off = d.length;

    let max = 8;
    let act = 0;

    symbols.forEach((v, k) => {
        let e = k.slice(0, max - 1);
        act = Math.max(act, e.length);
        off += e.length;
        d += e + stnts(off);
        off += tnts(off);
    });

    d += `${ver + ws(tm)}`;

    off += tab_s;

    prods.forEach((v, k) => {
        const e = grammar[k].name.slice(0, max - 1);
        act = Math.max(act, e.length);
        off += e.length;
        d += e + stnts(off);
        off += tnts(off);
    });

    if ((act + 2) > tab_s && tab_s < max)
        return renderTable(rule_table, grammar, (" ").repeat(Math.min(max, act + 2)));

    str += `${d + ver}\n`;

    /**** Dividing Bar ********/

    str += `${crl + hrz.repeat(tm) + crs + hrz.repeat(symbol_count * tab_s + tm) + crs + hrz.repeat(prod_count * tab_s + tm) + crs + hrz.repeat(max_body + 3) + crtr}\n`;


    /**** ENTRIES ************************/

    for (let i = 0; i < num_states; i++) {
        const p = preps[i];

        if ((i + "").length + 2 >= tab_s)
            return renderTable(rule_table, grammar, (" ").repeat((i + "").length + 4));

        d = `${ver} ${i + stnts(2 + (i+"").length) + ver + ws(tm)}`;

        let off = 0;

        for (const value of p.action.values()) {
            const action = value.v;

            d += `${tab.repeat(Math.max((value.off - off), 0))}`;

            switch (action.name) {
                case "ERROR":
                    d += `err` + stnts(3);
                    break;

                case "IGNORE":
                    d += `ign` + stnts(3);
                    break;

                case "SHIFT":
                    const state = value.v.state + "";

                    if (state.length + 2 >= tab_s)
                        return renderTable(rule_table, grammar, (" ").repeat(state.length + 4));

                    d += `s${state + stnts(state.length+1)}`;
                    break;
                case "REDUCE":
                    const body = value.v.body + "";

                    if (body.length + 2 >= tab_s)
                        return renderTable(rule_table, grammar, (" ").repeat(body.length + 4));

                    d += `r${body + stnts(body.length+1)}`;
                    break;
                case "ACCEPT":
                    d += `acc${stnts(3)}`;
                    break;
            }

            off = value.off + 1;
        }

        d += `${tab.repeat(Math.max((symbol_count - off), 0)) + ver + ws(tm)}`;

        off = 0;
        p.goto.forEach((v, k) => {
            let action = v.v + "";
            d += `${tab.repeat(Math.max((v.off - off), 0))}`;
            d += `${action+ stnts(action.length)}`;
            off = v.off + 1;
        });

        d += `${tab.repeat(Math.max((prod_count - off), 0))}${ver} `;

        const s = rule_table[i].b.join(" "),
            diff = max_body - s.length;

        d += `${s + (" ").repeat(diff + 2) + ver}\n`;

        str += d;

    }

    /**** Bottom Bar ************************/
    str += `${crbl + hrz.repeat(tm) + crb + hrz.repeat(symbol_count * tab_s + tm) + crb + hrz.repeat(prod_count * tab_s + tm) + crb + hrz.repeat(max_body + 3) + crbr}\n`;

    return str;
}