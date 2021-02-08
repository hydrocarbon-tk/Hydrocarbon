import { Grammar, ProductionBody } from "../../types/grammar.js";
import { Production } from "../../types/production.js";
import { Leaf, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/state_generating";
import { rec_glob_lex_name, rec_state, rec_state_prod } from "../../utilities/global_names.js";
import { Item, ItemIndex, itemsToProductions } from "../../utilities/item.js";
import { buildItemMaps } from "../../utilities/item_map.js";
import { renderItem } from "../../utilities/render_item.js";
import { SC } from "../../utilities/skribble.js";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../../utilities/symbol.js";
import { compileProductionFunctions, getStartItemsFromProduction } from "../function_constructor.js";
import { addIntermediateLeafStatements } from "./add_leaf_statements.js";
import { processProductionChain } from "./process_production_reduction_sequences.js";
import { Symbol } from "../../types/symbol.js";
export function default_resolveUnresolvedLeaves(node: TransitionNode, nodes: TransitionNode[], options: RenderBodyOptions): MultiItemReturnObject {

    const

        items = nodes.flatMap(s => s.items).setFilter(i => i.id),

        expected_symbols =
            nodes.flatMap(s => s.symbols).setFilter(getUniqueSymbolName)
                .concat(
                    items.flatMap(i => {
                        const sym = i.sym(options.grammar);
                        if (!Sym_Is_A_Production(sym))
                            return sym;
                        return [];
                    })
                ),

        anchor_state = SC.Variable("anchor_state:unsigned"),

        root: SC = (new SC).addStatement(
            nodes.flatMap(n => n.symbols).map(s => getUniqueSymbolName(s)).join(" ")
        ),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = nodes.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],

        out_leaves: Leaf[] = [];

    let FALLBACK_REQUIRED = items.every(i => i.atEND);

    if (!FALLBACK_REQUIRED)
        try {
            createVirtualProductionSequence(options, items, expected_symbols, root, out_prods, out_leaves);

        } catch (e) {
            root.statements.length = 0;
            root.addStatement(e.stack);
            FALLBACK_REQUIRED = true;
        }

    if (FALLBACK_REQUIRED) {


        root.addStatement(
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy"))),
                SC.Assignment(anchor_state, rec_state)
            ));

        let leaf = root, FIRST = true;// prev_prods;

        for (const { code, items, prods, leaves } of nodes.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)) {


            out_prods.push(...prods);
            out_leaves.push(...leaves);

            leaf.addStatement(SC.Comment(items));

            if (FIRST) {

                leaf.addStatement(
                    SC.Comment(prods),
                    code
                );

            } else {
                leaf.addStatement(
                    SC.Assignment(rec_state, SC.Call(
                        "reset:bool",
                        "mk",
                        "anchor:Lexer",
                        rec_glob_lex_name,
                        anchor_state
                    )),
                    code,
                    SC.Empty()
                );

            }

            // prev_prods = prods;

            FIRST = false;
        }

        if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
            leaf.addStatement(
                SC.Assignment(rec_state, SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    rec_glob_lex_name,
                    anchor_state
                )),
                SC.Empty()
            );
        }
    }

    return { root, leaves: out_leaves, prods: out_prods.setFilter() };
}

export function createVirtualProductionSequence(options: RenderBodyOptions,
    items: Item[],
    expected_symbols: Symbol[],
    root: SC,
    out_prods: number[],
    out_leaves: Leaf[]
) {
    const
        { grammar } = options,
        virtual_links: VirtualProductionLinks = createVirtualProductions(items, grammar);


    const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
        = compileProductionFunctions(options.grammar, options.helper, Array.from(virtual_links.values()), expected_symbols, true);

    addIntermediateLeafStatements(
        RD_fn_contents,
        GOTO_fn_contents,
        SC.Variable("testA"),
        RDOptions,
        GOTO_Options
    );

    if (options.scope == "RD")
        root.addStatement(SC.Declare(SC.Assignment(rec_state_prod, "0xFFFFFFFF")));
    root.addStatement(SC.Declare(SC.Assignment("preserved_state", "state")));

    root.addStatement(RD_fn_contents, GOTO_Options.NO_GOTOS ? undefined : GOTO_fn_contents);

    let leaf = root; // prev_prods;

    items.sort((a, b) => +a.atEND - +b.atEND);


    for (let i = 0; i < items.length; i++) {

        const item = Item.fromArray(items[i]);
        const v_prod = virtual_links.get(item.id);
        const ITEM_AT_END = item.atEND;

        leaf.addStatement(item.renderUnformattedWithProduction(grammar));

        item[ItemIndex.offset] = item[ItemIndex.length];

        const prod = item.getProduction(grammar).id;

        const _if = SC.If(ITEM_AT_END ? SC.Empty() : SC.Binary("prod", "==", v_prod.id));
        let _if_leaf = new SC;
        _if.addStatement(SC.Assignment("state", "preserved_state"));
        _if.addStatement(_if_leaf);

        _if_leaf = renderItem(_if_leaf, item, options);

        const prods = processProductionChain(_if_leaf, options, itemsToProductions([item], grammar));

        out_prods.push(...prods);

        leaf.addStatement(_if);
        leaf = _if;

        out_leaves.push({
            prods: prods,
            root: _if,
            leaf: _if_leaf,
            hash: "----------------",
            transition_type: TRANSITION_TYPE.ASSERT_END,
        });
    }
}
import crypto from "crypto";
import { generateGUIDConstName } from "../../utilities/code_generating.js";
export function createVirtualProductionSequence2(
    options: RenderBodyOptions,
    items: Item[],
    expected_symbols: Symbol[],
    root: SC,
    out_leaves: Leaf[]
) {
    const
        { grammar } = options,
        virtual_links: VirtualProductionLinks = createVirtualProductions(items, grammar);


    const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
        = compileProductionFunctions(options.grammar, options.helper, Array.from(virtual_links.values()), [], true);

    addIntermediateLeafStatements(
        RD_fn_contents,
        GOTO_fn_contents,
        SC.Variable("testA"),
        RDOptions,
        GOTO_Options
    );
    const name = crypto.createHash('md5').update(items.map(i => i.id).join("")).digest("hex");
    const vc_name = SC.Variable(`vc_${name.slice(0, 10)}:u32`);
    const vp_fn = SC.Function("", "l", "data", "state")
        .addStatement(
            SC.Declare(SC.Assignment(rec_state_prod, "0xFFFFFFFF")),
            RD_fn_contents,
            GOTO_Options.NO_GOTOS ? undefined : GOTO_fn_contents,
            SC.UnaryPre(SC.Return, SC.Value("prod"))
        );

    const call = options.helper.add_constant(vc_name, vp_fn);

    root.addStatement(SC.Declare(SC.Assignment("v_prod", SC.Call(call, "l", "data", "state"))));


    let leaf = root; // prev_prods;

    items.sort((a, b) => +a.atEND - +b.atEND);


    for (let i = 0; i < items.length; i++) {

        const item = Item.fromArray(items[i]);
        const v_prod = virtual_links.get(item.id);
        const ITEM_AT_END = item.atEND;

        // leaf.addStatement(item.renderUnformattedWithProduction(grammar));

        item[ItemIndex.offset] = item[ItemIndex.length];

        const prod = item.getProduction(grammar).id;

        const _if = SC.If(ITEM_AT_END ? SC.Empty() : SC.Binary("v_prod", "==", v_prod.id));
        let _if_leaf = new SC;
        _if.addStatement(_if_leaf);

        _if_leaf = renderItem(_if_leaf, item, options);

        const prods = processProductionChain(_if_leaf, options, itemsToProductions([item], grammar));

        leaf.addStatement(_if);
        leaf = _if;

        out_leaves.push({
            prods: prods,
            root: _if,
            leaf: _if_leaf,
            hash: "----------------",
            transition_type: TRANSITION_TYPE.ASSERT,
        });
    }
}

function remapBodyModifiers<B>(map: Map<number, B>, item: Item): Map<number, B> {
    return new Map([...map.entries()]
        .filter(([number]) => number >= item.offset)
        .map(([number, value]) => [number - item.offset, value]));
}

type VirtualProductionLinks = Map<string, Production>;

function createVirtualProductions(items: Item[], grammar: Grammar): VirtualProductionLinks {
    const output: VirtualProductionLinks = new Map;

    //Create virtual productions for this state. 
    for (const item of items) {



        const
            body = item.body_(grammar),
            sym = body.sym.slice(item.offset),
            virtual_body = <ProductionBody>{
                id: grammar.bodies.length,
                name: `virtual-body-${item.id}`,
                BUILT: true,
                FORK_ON_ENTRY: false,
                error: null,
                sym: sym,
                excludes: remapBodyModifiers(body.excludes, item),
                reset: remapBodyModifiers(body.reset, item),
                ignore: remapBodyModifiers(body.ignore, item),
                length: sym.length,
                uid: sym.map(getUniqueSymbolName).join(":"),
                production: null,
            },

            production = <Production>{
                id: grammar.length,
                name: `virtual-${item.id}`,
                type: "virtual-production",
                HAS_EMPTY: false,
                CHECKED_FOR_EMPTY: false,
                IMPORTED: false,
                bodies: [virtual_body],
            };

        virtual_body.production = production;

        grammar.bodies.push(virtual_body);
        grammar.push(production);
        output.set(item.id, production);
    }

    buildItemMaps(grammar, Array.from(output.values()));

    return output;
}
