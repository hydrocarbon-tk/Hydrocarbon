//Creates a state table diagram for diognostic purposes
//Outputs string containing table value
const tab = String.fromCharCode(9);
const crs = String.fromCharCode(0x254B)
const hrz = String.fromCharCode(0x2501)
const ver = String.fromCharCode(0x2503)

export function renderTable(rule_table) {
    let str = "";

    let num_states = rule_table.length;
    let symbols = new Map();
    let prods = new Map();
    let symbol_count = 0;
    let prod_count = 0;
    let preps = [];

    //Preperation
    for (let i = 0; i < num_states; i++) {
        let state = rule_table[i];

        let prep = { action: [], goto: [] };

        state.action.forEach((v, k) => {
            if (!symbols.has(k)) {
                symbols.set(k, symbol_count++);
            }

            prep.action.push({ k, v, off: symbols.get(k) });
        })

        state.goto.forEach((v, k) => {

            if (!prods.has(k)) {
                prods.set(k, prod_count++);
            }

            prep.goto.push({ k, v, off: prods.get(k) });
        })


        prep.action.sort((a, b) => a.off < b.off ? -1 : 0);
        prep.goto.sort((a, b) => a.off < b.off ? -1 : 0);

        preps.push(prep);
    }

    str += `${tab}State${tab}${ver}${tab}`

    symbols.forEach((v,k)=>{

    	str+=`${k}${tab}`
    })
    str+=`${ver}${tab}`

    prods.forEach((v,k)=>{
		let name = rule_table.grammar[k].name.slice(0,5)
    	str+=`${name}${tab}`
    })

    str += '\n';
	str += `${tab}${hrz.repeat(8)}${crs}${hrz.repeat(symbol_count * 8 + 7)}${crs}${hrz.repeat(prod_count * 8 + 4)}\n`

    for (let i = 0; i < num_states; i++) {
        let p = preps[i];
        str += `${tab}${i}${tab}${ver}${tab}`

        let off = 0;
        p.action.forEach((v,k) => {
            let action = v.v;
            str += `${tab.repeat(Math.max((v.off - off), 0))}`;
            switch(action.name){
            	case "SHIFT":
            		str += `s${v.v.state}`;
            	break;
            	case "REDUCE":
            		str += `r${v.v.len}`;
            	break;
            	case "ACCEPT":
            		str += `accept`;
            	break;
            }
            str += tab
            off = v.off + 1;
        })

        str += `${tab.repeat(Math.max((symbol_count - off), 0))}${ver}${tab}`;

        p.goto.forEach((v,k) => {
            let action = v.v;
            str += `${tab.repeat(Math.max((v.off - off), 0))}`;
            str += `${v.v}`;
            str += tab
            off = v.off + 1;
        })

        str += "\n"
        //GOTO

    }

    return str;
}
