import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { SelectionClauseGenerator, SelectionGroup } from "../../types/state_generating";
import { DefinedSymbol, Symbol, TokenSymbol } from "../../types/symbol.js";
import { buildSwitchIfsAlternate, createAssertionShiftManual, createSkipCall, generateGUIDConstName, getIncludeBooleans, renderProductionCall } from "../../utilities/code_generating.js";
import { rec_glob_data_name, rec_glob_lex_name } from "../../utilities/global_names.js";
import { Item } from "../../utilities/item.js";
import { ExprSC, SC, VarSC } from "../../utilities/skribble.js";
import {
    Defined_Symbols_Occlude,
    getSkippableSymbolsFromItems,
    getSymbolName,
    getUniqueSymbolName,
    Symbols_Are_The_Same, Sym_Is_A_Generic_Type, Sym_Is_A_Production,
    Sym_Is_Defined,
    Sym_Is_EOF
} from "../../utilities/symbol.js";
import { ttt } from "./ttt.js";
/**
 * Handles intermediate state transitions. 
 */
export function default_resolveBranches(
    gen: SelectionClauseGenerator,
    state: RecognizerState,
    items: Item[],
    level: number,
    options: RenderBodyOptions,
    FORCE_ASSERTIONS: boolean = false
): SC {

    const
        { grammar, helper: runner } = options,
        groups = [...gen],
        all_syms = groups.flatMap(({ syms }) => syms).setFilter(getUniqueSymbolName);

    if (groups.length == 1
        && !FORCE_ASSERTIONS
        && (groups[0].transition_types.includes(TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)))
        return groups[0].code;

    let
        root = new SC,
        lex_name = rec_glob_lex_name,
        peek_name = rec_glob_lex_name;

    peek_name = createPeekStatements(options,
        state,
        root,
        lex_name,
        peek_name,
        getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getSymbolName(i) == getSymbolName(j)))
    );

    if (groups.length > 4 && items.filter(i => i.atEND).setFilter(i => i.id).length <= 1)

        createSwitchBlock(options, groups, lex_name, all_syms, root);

    else

        createIfElseBlock(options, groups, root, lex_name, peek_name, all_syms, FORCE_ASSERTIONS);

    root.addStatement(SC.Empty());

    return root;
}

function createSwitchBlock(
    options: RenderBodyOptions,
    groups: SelectionGroup[],
    lex_name: VarSC,
    all_syms: Symbol[],
    root: SC
) {
    const { grammar, helper: runner } = options;
    const defined_symbols: [DefinedSymbol, number][] = <any>groups.flatMap((g, i) => g.syms.filter(Sym_Is_Defined).map(s => [s, i]));
    const defined_symbols_lu = new Map(defined_symbols);
    //Only need to look for generic type; Groups do not transition on productions
    const other_symbols = groups.flatMap((g, i) => g.syms.filter(Sym_Is_A_Generic_Type).map(s => [i, s]));


    let if_root = null, leaf = null;
    for (const [id, sym] of other_symbols) {
        const sc = SC.If(getIncludeBooleans([sym], grammar, runner, lex_name, all_syms))
            .addStatement(SC.UnaryPre(SC.Return, SC.Value(id)));
        if (!if_root) {
            if_root = sc;
            leaf = sc;
        } else {
            leaf.addStatement(sc);
            leaf = sc;
        }
    }

    const fn_lex_name = SC.Constant("l:Lexer");
    const gen = buildSwitchIfsAlternate(grammar, defined_symbols.map(([s]) => s), fn_lex_name);

    let yielded = gen.next();

    while (!yielded.done) {
        const { code_node, sym } = yielded.value;
        code_node.addStatement(
            getUniqueSymbolName(sym),
            SC.Assignment(SC.Member(lex_name, "type"), "TokenSymbol"),
            SC.Assignment(SC.Member(lex_name, "byte_length"), sym.byte_length),
            SC.Assignment(SC.Member(lex_name, "token_length"), sym.val.length),
            SC.UnaryPre(SC.Return, SC.Value(defined_symbols_lu.get(sym)))
        );
        yielded = gen.next();
    }

    const
        code_node = yielded.value,
        fn = SC.Function(":boolean", fn_lex_name, rec_glob_data_name).addStatement(code_node, if_root),
        node_name = generateGUIDConstName(fn, `defined_token`, "bool"),
        fn_name = runner.add_constant(node_name, fn),
        sw = SC.Switch(SC.Call(fn_name, lex_name, rec_glob_data_name));


    for (let i = 0; i < groups.length; i++) {
        let { syms, items, code, LAST, FIRST, transition_types } = groups[i];
        if (items.some(i => i.atEND))
            sw.addStatement(SC.If(SC.Value("default")));
        sw.addStatement(SC.If(SC.Value(i)).addStatement(code, SC.Break));
    }

    root.addStatement(sw);
}

function createPeekStatements(
    options: RenderBodyOptions,
    state: RecognizerState,
    root: SC,
    lex_name: VarSC,
    peek_name: VarSC,
    skippable: TokenSymbol[]
) {

    const
        { grammar, helper: runner } = options;

    if (state.peek_level >= 0) {
        if (state.peek_level == 1) {
            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
        }

        if (state.offset > 0 && state.peek_level == 0) {

            root.addStatement(createSkipCall(skippable, grammar, runner, lex_name));
        } else if (state.peek_level >= 1) {

            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(createSkipCall(skippable, grammar, runner, SC.Call(SC.Member(peek_name, "next"), rec_glob_data_name)));
        }
    } else if (state.offset > 0) {
        //Consume
        root.addStatement(createSkipCall(skippable, grammar, runner));
    }
    return peek_name;
}

function createIfElseBlock(
    options: RenderBodyOptions,
    groups: SelectionGroup[],
    root: SC,
    lex_name: VarSC,
    peek_name: VarSC,
    all_syms: Symbol[],
    FORCE_ASSERTIONS: boolean,
) {

    let leaf = null;
    const
        { grammar, helper: runner } = options;
    for (let i = 0; i < groups.length; i++) {
        let { syms, items, code, LAST, FIRST, transition_types } = groups[i];

        let gate_block: SC = SC.Empty();

        const transition_type: TRANSITION_TYPE = transition_types[0];

        switch (transition_type) {

            case TRANSITION_TYPE.PEEK:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:

                gate_block = (Sym_Is_A_Production(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options, peek_name)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>all_syms);
                break;
            case TRANSITION_TYPE.ASSERT_END:

                const other_transition_syms = groups.filter((l, j) => j != i).flatMap(g => g.syms).setFilter(getUniqueSymbolName);

                let pending_syms = syms;
                // Remove symbols that should lead to a shift
                // This overcomes shift-reduce ambiguities
                if (other_transition_syms.length > 0)
                    pending_syms = pending_syms
                        .filter(s => !other_transition_syms.some(o => Symbols_Are_The_Same(s, o)));

                // The number of follow symbols may appear here quite can be quite
                // high. An alternative to making an assertion of these symbol may be to make
                // a negated assertion of the symbols that are anticipated by other transitions
                if (other_transition_syms.length < pending_syms.length) {
                    const primary_symbols = syms.filter(a => other_transition_syms.some(o => Sym_Is_EOF(a) || Defined_Symbols_Occlude(a, o)));
                    const negate_symbols = other_transition_syms;
                    const remaining_symbols = getIncludeBooleans(<TokenSymbol[]>primary_symbols, grammar, runner, peek_name);
                    const negated_expression = getIncludeBooleans(<TokenSymbol[]>negate_symbols, grammar, runner, peek_name);
                    if (negated_expression) {

                        if (primary_symbols.length > 0)
                            gate_block = SC.Binary(SC.UnaryPre("!", negated_expression), "||", remaining_symbols);
                        else
                            gate_block = SC.UnaryPre("!", negated_expression);
                    } else gate_block = SC.Empty();
                } else {
                    gate_block = getIncludeBooleans(<TokenSymbol[]>pending_syms, grammar, runner, peek_name, <TokenSymbol[]>all_syms);
                }

                break;

            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:

                gate_block = (Sym_Is_A_Production(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>all_syms);
                break;

            case TRANSITION_TYPE.CONSUME:

                gate_block = (Sym_Is_A_Production(syms[0]))
                    ? createAssertionShiftManual(rec_glob_lex_name, renderProductionCall(grammar[syms[0].val], options))
                    : createAssertionShiftManual(rec_glob_lex_name, getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name, <TokenSymbol[]>all_syms));
                break;

            case TRANSITION_TYPE.IGNORE:
                gate_block = SC.Empty();
                break;
        }

        let if_stmt = SC.If(<ExprSC>gate_block);

        const SKIP_BOOL_EXPRESSION = (!FORCE_ASSERTIONS || transition_type == TRANSITION_TYPE.ASSERT_END)
            && (LAST && !FIRST)
            && (
                transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                //|| transition_type == TRANSITION_TYPE.ASSERT
                || transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.ASSERT_END
            );

        if (SKIP_BOOL_EXPRESSION)
            if_stmt = SC.If();


        if_stmt.addStatement(
            runner.ANNOTATED ?
                SC.Comment(transition_types.map(ttt))
                : undefined,
            runner.ANNOTATED ?
                SC.Comment("\n   " + items.map(i => ((transition_type == TRANSITION_TYPE.CONSUME && !i.atEND) ? i.increment() : i)
                    .renderUnformattedWithProduction(grammar)).join("\n   ") + "\n")
                : undefined,
            code,
            SC.Empty()
        );

        if (leaf) {
            leaf.addStatement(if_stmt);
        } else {
            root.addStatement(if_stmt);
        }

        leaf = if_stmt;
    }

    if (leaf) leaf.addStatement(SC.Empty());
}




