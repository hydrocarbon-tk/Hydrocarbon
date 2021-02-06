import { RecognizerState } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { SelectionClauseGenerator } from "../../types/state_generating";
import { getClosure } from "../../utilities/closure.js";
import { createSkipCall, getIncludeBooleans } from "../../utilities/code_generating.js";
import { getFollow } from "../../utilities/follow.js";
import { rec_glob_lex_name, rec_state, rec_state_prod } from "../../utilities/global_names.js";
import { Item } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import {
    Defined_Symbols_Occlude, getComplementOfSymbolSets,
    getSkippableSymbolsFromItems,
    getSymbolName,
    getSymbolsFromClosure,
    getUniqueSymbolName,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Generic_Newline,
    Sym_Is_A_Generic_Number, Sym_Is_A_Space_Generic, Sym_Is_A_Generic_Symbol,
    Sym_Is_Defined_Characters, Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number
} from "../../utilities/symbol.js";
import { default_resolveBranches } from "./default_branch_resolution.js";


export function processGoTOStates(gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions): SC {

    if (state.offset == 0) {

        const
            { grammar, helper: runner, production_ids } = options,
            goto_groups = [...gen];

        let switch_stmt: SC = SC.Switch(rec_state_prod);

        for (const { syms, items, code, hash, leaves } of goto_groups.sort(
            (a, b) => compareStringsForSort(<any>a.syms[0].val, <any>b.syms[0].val))
        ) {

            let anticipated_syms;

            const
                keys = (<number[]><any>syms).setFilter(),
                active_items = items.filter(i => !i.atEND),
                end_items = items.filter(i => i.atEND),
                skippable = getSkippableSymbolsFromItems(items, grammar)
                    .filter(sym => !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym)));

            leaves.map(l => l.keys = keys);

            let interrupt_statement = null;


            if (active_items.length > 0) {
                const
                    closure = getClosure(active_items.slice(), grammar);
                anticipated_syms = getSymbolsFromClosure(closure, grammar);

                /**
                 * Create look ahead for a preemptive reduce on keys that match the production id
                 */
                if (keys.some(k => production_ids.includes(k))) {

                    /**
                    *   Criteria for checked symbols 
                    *
                    *   fs = follow_symbols
                    *   as = anticipated_symbols
                    *   cs = symbols that should be check
                    *   
                    *   cs = occluded((fs \ as), as) 
                    * 
                    *   where occluded(syms , oc) is
                    *       
                    *       syms = checked symbols
                    *       oc = potential occluders = (fs ∪ as)
                    *       SY = type declared symbol
                    *       ID = type declared identifier
                    *       NU = type declared number
                    *       
                    *       for s in syms
                    *           
                    *           s is (g:ws | g:nl) : yield
                    *
                    *           s is (g:*) : discard
                    * 
                    *           s is SY 
                    *              & ( g:sym ∈ oc | ( a is DS & a ∈ oc & n exists where a[0,n] == s[0,n] where n > 1 and n >= a.length) ) : yield
                    * 
                    *           s is ID 
                    *              & ( g:id ∈ oc | g:ws ∉ syms | g:nl ∉ syms
                    *                  |  ( a is ID & a ∈ oc & n exists where a[0...n] == s[0...n] where n > 1 and n = a.length)  )
                    *              ) : yield
                    *               
                    *           s is NU 
                    *              & ( g:id ∈ oc | g:ws ∉ syms | g:nl ∉ syms
                    *                  |  ( a is NU & a ∈ oc & n exists where a[0...n] == s[0...n] where n > 1 and n = a.length)  ) 
                    *              ) : yield
                    * 
                    * 
                    */
                    const unique_candidates = getComplementOfSymbolSets(
                        keys.flatMap(k => getFollow(k, grammar)).setFilter(sym => getUniqueSymbolName(sym)),
                        anticipated_syms
                    ),
                        checked_symbols = [],

                        GEN_SYM = anticipated_syms.some(Sym_Is_A_Generic_Symbol),
                        GEN_ID = anticipated_syms.some(Sym_Is_A_Generic_Identifier),
                        GEN_NUM = anticipated_syms.some(Sym_Is_A_Generic_Number),
                        CONTAINS_WS = unique_candidates.some(Sym_Is_A_Space_Generic) || !skippable.some(Sym_Is_A_Space_Generic),
                        CONTAINS_NL = unique_candidates.some(Sym_Is_A_Generic_Newline) || !skippable.some(Sym_Is_A_Generic_Newline),
                        GEN_NL_WS = CONTAINS_NL || CONTAINS_WS;


                    for (const s of unique_candidates) {

                        if (Sym_Is_A_Generic_Newline(s) || Sym_Is_A_Space_Generic(s))
                            checked_symbols.push(s);
                        else if (Sym_Is_A_Generic_Type(s))
                            continue;
                        else if (Sym_Is_Defined_Characters(s)) {
                            if (GEN_SYM || anticipated_syms.some(a => Defined_Symbols_Occlude(s, a))) checked_symbols.push(s);
                        } else if (Sym_Is_Defined_Identifier(s) && !GEN_NL_WS) {
                            if (GEN_ID || anticipated_syms.some(a => Defined_Symbols_Occlude(s, a))) checked_symbols.push(s);
                        } else if (Sym_Is_Defined_Natural_Number(s) && !GEN_NL_WS) {
                            if (GEN_NUM || anticipated_syms.some(a => Defined_Symbols_Occlude(s, a))) checked_symbols.push(s);
                        }
                    }

                    if (checked_symbols.length > 0) {


                        const
                            booleans = getIncludeBooleans(checked_symbols, grammar, runner, rec_glob_lex_name, anticipated_syms);

                        if (booleans) {
                            interrupt_statement = SC.If(booleans).addStatement(
                                SC.UnaryPre(SC.Return, rec_state)
                            );
                        }
                    }
                }
            }

            switch_stmt.addStatement(
                ...keys.slice(0, -1).map(k => SC.If(SC.Value(k + ""))),
                SC.If(SC.Value(keys.pop() + ""))
                    .addStatement(
                        active_items.length > 0 || end_items.length > 1
                            ? createSkipCall(skippable, grammar, runner)
                            : undefined,
                        interrupt_statement,
                        code
                    )
            );

            if (goto_groups.length == 1) {
                switch_stmt = new SC().addStatement(...switch_stmt.statements[0].statements);
            } else {
                switch_stmt.statements[switch_stmt.statements.length - 1].addStatement(SC.Break);
            }
        }

        return SC.While(
            SC.Value(1)
        )
            .addStatement(
                switch_stmt,
                SC.Break
            );
    }

    state.offset--;

    return default_resolveBranches(gen, state, items, level, options, state.offset <= 1);
}
function compareStringsForSort(strA: any, strB: any): number {
    return (strA > strB)
        ? 1
        : (strA < strB)
            ? -1
            : 0;
}

export function addClauseSuccessCheck(options: RenderBodyOptions): SC {
    const { productions } = options;
    const condition = productions.map(p => (SC.Binary(rec_state_prod, "==", SC.Value(p.id)))).reduce(reduceOR);
    return SC.UnaryPre(SC.Return, SC.Call("assertSuccess", rec_glob_lex_name, rec_state, condition));
}

function reduceOR<T>(red: T, exp: T, i: number): T {
    if (!red) return exp;
    return <T><any>SC.Binary(<any>red, "||", <any>exp);
}

export function createDebugCall(options: RenderBodyOptions, action_name, debug_items: Item[] = []) {

    const { productions: production, helper: runner } = options;
    return SC.Empty();
    if (runner.DEBUG)
        return SC.Value(`debug_add_header(0,l.getOffsetRegionDelta(),0,0,0,0)`);

    else
        return SC.Empty();
}
