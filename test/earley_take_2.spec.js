import URL from "@candlelib/url";
import { getGrammar } from "./tools.js";

const uri = URL.resolveRelative("./source/grammars/misc/test.hcg");
const grammar = await getGrammar(uri + "");

const item_lu = [...grammar.item_map.values()].map(d => d.item).filter(i => i.offset == 0);
const item_stack_a = item_lu.map((i, j) => ({
    prod: i.getProduction(grammar).id,
    active: i.sym(grammar).type != "production",
    production: i.sym(grammar).type == "production" ? i.sym(grammar).val : -1,
    offset: 0,
    length: i.len,
    index: j,
    branch: 0,
    token_offset: 0
}));
const item_stack_b = item_stack_a.map(a => Object.assign({}, a));

const actions = [];

let minimum_advance = 0, branch = 0;

function setLUProduction(lu_a, lu_b, a, b, token_offset, branch) {
    const item = getItemAtOffset(lu_b.index, lu_b.offset);
    const sym = item.sym(grammar);

    if (sym.type == "production") {

        lu_b.production = sym.val;

        for (let i = 0; i < a.length; i++) {
            if (a[i].prod == sym.val && b[i].token_offset < token_offset) {

                b[i].token_offset = Math.max(b[i].token_offset, token_offset);

                b[i].branch = branch;

                if (a[i].offset == 0)

                    setLUProduction(a[i], b[i], a, b, token_offset, branch);
            }
        }
    } else
        lu_b.production = -1;
}

function getItemAtOffset(i, offset) {
    let item = item_lu[i];
    for (let i = 0; i < offset; i++)
        item = item.increment();
    return item;
}

function incrementProduction(item, a, b, token_offset, branch) {

    const id = item.getProduction(grammar).id;

    for (let i = 0; i < a.length; i++) {

        const lu_a = a[i];
        const lu_b = b[i];

        if (lu_a.production == id && lu_a.token_offset < token_offset) {

            //if (!lu.active)
            //    lu.active = true;

            lu_b.token_offset = token_offset;

            lu_b.branch = branch;

            if (lu_a.offset + 1 >= lu_a.length) {

                actions.push(`reduce [${grammar[lu_a.prod].name}]<${token_offset}>(${branch})`);

                lu_b.active = false;

                lu_b.offset = 0;

                lu_a.offset = 0;

                const item = getItemAtOffset(lu_b.index, 0);

                lu_b.production = item.sym(grammar).type == "production" ? item.sym(grammar).val : -1;

                incrementProduction(item, a, b, token_offset, branch);

                continue;
            } else {
                lu_b.offset = lu_a.offset + 1;
            }

            setLUProduction(lu_a, lu_b, a, b, token_offset, branch);
        }
    }
}

function itemKernel(lu_a, lu_b, a, b, input, min) {
    if (lu_a.production >= 0) {
        return;
    } else if (lu_a.token_offset >= min) {
        const item = getItemAtOffset(lu_a.index, lu_a.offset);
        const sym = item.sym(grammar);


        //actions.push(`- ${sym.val} <${lu_a.token_offset}> - [${input.slice(lu_a.token_offset)}]`);

        if (input.slice(lu_a.token_offset).indexOf(sym.val) == 0) {

            lu_b.offset = lu_a.offset + 1;

            lu_b.token_offset = Math.max(lu_a.token_offset + sym.val.length, lu_b.token_offset);

            minimum_advance = Math.min(minimum_advance, lu_b.token_offset);

            actions.push(`shift [${sym.val}]`);


            setLUProduction(lu_a, lu_b, a, b, lu_b.token_offset, branch);

            if (lu_b.offset >= lu_b.length) {

                lu_b.branch = lu_a.branch + (branch++);

                actions.push(`reduce [${grammar[lu_b.prod].name}](${branch})`);

                //Complete the production and activate 
                //All items that are offset for this item
                incrementProduction(item, a, b, lu_b.token_offset, lu_b.branch);

                lu_b.offset = 0;
            }


        } else {

            //deactivate the item
        }
    }

}

function runKernels(input, a, b) {
    branch = 0;
    actions.push("-----------");
    const advance = minimum_advance;
    minimum_advance = Infinity;

    for (let i = 0; i < a.length; i++) {
        itemKernel(a[i], b[i], a, b, input, advance);
    }

    if (advance == minimum_advance)
        return false;
    return true;
}

function parse(input) {
    const a = item_stack_a;
    const b = item_stack_b;
    while (true) {
        if (!runKernels(input, a, b)) break;
        if (!runKernels(input, b, a)) break;
    }
}



assert_group(sequence, () => {
    const input = "2+2+0";
    parse(input);

    assert(actions.join("\n") == "");

});


