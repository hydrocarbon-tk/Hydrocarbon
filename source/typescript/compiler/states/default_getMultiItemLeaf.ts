import { Grammar, ProductionBody } from "../../types/grammar.js";
import { Production } from "../../types/production.js";
import { Leaf, RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/state_generating";
import { getClosure } from "../../utilities/closure.js";
import { rec_glob_lex_name, rec_state } from "../../utilities/global_names.js";
import { Item } from "../../utilities/item.js";
import { buildItemMaps } from "../../utilities/item_map.js";
import { SC } from "../../utilities/skribble.js";
import { getSymbolsFromClosure, getUniqueSymbolName } from "../../utilities/symbol.js";
import { compileProductionFunctions, getStartItemsFromProduction } from "../function_constructor.js";



export function default_getMultiItemLeaf(state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions): MultiItemReturnObject {

    const

        items = states.flatMap(s => s.items).setFilter(i => i.id),

        anchor_state = SC.Variable("anchor_state:unsigned"),

        root: SC = (new SC).addStatement(
            items.map(p => p.id).join(">   <"),
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy"))),
                SC.Assignment(anchor_state, rec_state)
            )
        ),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = states.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],

        out_leaves: Leaf[] = [];

    try {
        const
            { grammar } = options,
            productions: Production[] = createVirtualProductions(items, grammar),
            its = productions.flatMap(p => getStartItemsFromProduction(p)),
            closure = getClosure(its, grammar),
            syms = getSymbolsFromClosure(closure, grammar);

        const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
            = compileProductionFunctions(options.grammar, options.helper, productions);

        root.addStatement(RD_fn_contents, GOTO_fn_contents);

    } catch (e) {

        root.addStatement(e.stack);

        let leaf = root, FIRST = true;// prev_prods;

        for (const { code, items, prods, leaves } of states.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)) {

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

function remapBodyModifiers<B>(map: Map<number, B>, item: Item): Map<number, B> {
    return new Map([...map.entries()]
        .filter(([number]) => number >= item.offset)
        .map(([number, value]) => [number - item.offset, value]));
}

function createVirtualProductions(items: Item[], grammar: Grammar) {
    const productions: Production[] = [];

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
                type: "production",
                HAS_EMPTY: false,
                CHECKED_FOR_EMPTY: false,
                IMPORTED: false,
                bodies: [virtual_body],
            };

        virtual_body.production = production;

        grammar.bodies.push(virtual_body);
        grammar.push(production);
        productions.push(production);
    }

    buildItemMaps(grammar, productions);

    return productions;
}
