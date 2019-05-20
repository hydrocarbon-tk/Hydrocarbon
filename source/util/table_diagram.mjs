//Creates a state table diagram for diognostic purposes
//Outputs string containing table value
const crs = String.fromCharCode(0x254B);
const crt = String.fromCharCode(0x2533);
const crb = String.fromCharCode(0x253B);
const crl = String.fromCharCode(0x2523);
const crr = String.fromCharCode(0x252B);
const hrz = String.fromCharCode(0x2501);
const ver = String.fromCharCode(0x2503);
const crtl = String.fromCharCode(0x250F);
const crtr = String.fromCharCode(0x2513);
const crbr = String.fromCharCode(0x251B);
const crbl = String.fromCharCode(0x2517);
import util from "util";

import { types, filloutGrammar } from "./common.mjs";

export function renderTable(states, grammar, tab = "   ", tab_s = tab.length) {

     //Build new env variables if they are missing 
    if (!grammar.bodies) {
        filloutGrammar(grammar, {functions:{}});
    }
    
    //console.log(util.inspect(grammar.meta.all_symbols, false, 5, true))


    const ws = (count) => (" ").repeat(count);
    const tnts = (h) => ((Math.ceil((h + 0.5) / tab_s) * tab_s) - h);
    const stnts = (h) => ws(tnts(h));
    

    let str = "";
    
    const 
        rule_table = states;

    if (rule_table.INVALID) {
        console.error("Invalid state set passed. Cannot continue.");
        return;
    }

    let num_states = rule_table.length;
    let symbols = new Map();
    let prods = new Map();
    let max_body = 0;
    let symbol_count = 0;
    let prod_count = 0;
    let preps = [];

    /****** Preperation ********/

    for (let i = 0; i < num_states; i++) {
        let state = rule_table[i];

        let prep = { action: [], goto: [] };

        max_body = Math.max(max_body, state.b.join(" ").length)

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

    let max = 16;
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
        let e = grammar[k].name.slice(0, max - 1);
        act = Math.max(act, e.length);
        off += e.length;
        d += e + stnts(off);
        off += tnts(off);
    });

    if ((act + 2) > tab_s && tab_s < max)
        return renderTable(rule_table, grammar, (" ").repeat(Math.min(max, act + 2)));

    str += `${d + ver}\n`;

    /**** Dividing Bar ********/

    str += `${crl + hrz.repeat(tm) + crs + hrz.repeat(symbol_count * tab_s + tm) + crs + hrz.repeat(prod_count * tab_s + tm) + crs + hrz.repeat(max_body + 3) + crtr}\n`


    /**** ENTRIES ************************/

    for (let i = 0; i < num_states; i++) {
        let p = preps[i];

        if ((i + "").length + 2 >= tab_s)
            return renderTable(rule_table,grammar,  (" ").repeat((i + "").length + 4));

        d = `${ver} ${i + stnts(2 + (i+"").length) + ver + ws(tm)}`;

        let off = 0;

        p.action.forEach((v, k) => {
            let action = v.v;

            d += `${tab.repeat(Math.max((v.off - off), 0))}`;

            switch (action.name) {
                case "ERROR":

                    //if (state.length + 2 >= tab_s)
                    //    return renderTable(rule_table, (" ").repeat(state.length + 4));

                    d += `err` + stnts(3);
                    break;

                case "IGNORE":
                    //if (state.length + 2 >= tab_s)
                    //    return renderTable(rule_table, (" ").repeat(state.length + 4));

                    d += `ign` + stnts(3);
                    break;

                case "SHIFT":
                    let state = v.v.state + "";

                    if (state.length + 2 >= tab_s)
                        return renderTable(rule_table,grammar, (" ").repeat(state.length + 4));

                    d += `s${state + stnts(state.length+1)}`;
                    break;
                case "REDUCE":
                    let body = v.v.body + "";

                    if (body.length + 2 >= tab_s)
                        return renderTable(rule_table,grammar, (" ").repeat(body.length + 4));

                    d += `r${body + stnts(body.length+1)}`;
                    break;
                case "ACCEPT":
                    d += `acc${stnts(3)}`;
                    break;
            }

            off = v.off + 1;
        });

        d += `${tab.repeat(Math.max((symbol_count - off), 0)) + ver + ws(tm)}`;

        off = 0
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

    return str;//.replace(/\t/g, (" ").repeat(8));
}
