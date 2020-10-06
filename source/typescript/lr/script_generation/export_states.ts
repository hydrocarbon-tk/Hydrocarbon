
import { Grammar, Production, ProductionBody, Symbol } from "../../types/grammar.js";
import { Item } from "../../util/item.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
import { LRState, ParserAction } from "../../types/lr_state.js";
import { filloutGrammar } from "../../util/common.js";
import { Lexer } from "@candlefw/wind";

function extractAction(act: any): ParserAction {
	return <ParserAction>{
		body: act.b,
		state: act.s,
		name: act.n,
		size: act.sz,
		actions: act.ac ? act.ac.map(extractAction) : null,
		symbol_type: act.st,
		offset: act.off,
		symbol: act.sym,
		production: act.p
	};
}

function prepareAction(act: ParserAction): any {
	return <any>{
		b: act.body,
		s: act.state,
		n: act.name,
		sz: act.size,
		ac: act.actions ? act.actions.map(prepareAction) : null,
		st: act.symbol_type,
		off: act.offset,
		sym: act.symbol,
		p: act.production
	};
}

export function ExportStates(states: LRState[], grammar: Grammar) {

	const urls = new Map(),
		symbol_array = [],
		symbols = new Map();

	function getSymbolId(sym: Symbol): number {

		const sym_id = sym.name + sym.val;

		if (symbols.has(sym_id)) return symbols.get(sym_id);

		symbol_array.push(<Symbol><any>{
			type: sym.type,
			val: sym.val,
			name: sym.name,
			precedence: sym.precedence,
			pos: getPos(sym.pos),
			offset: sym.offset
		});

		symbols.set(sym_id, symbols.size);

		return getSymbolId(sym);
	}

	function getPos(pos: Lexer): number[] {
		if (!pos)
			return [];
		return [pos.off, pos.column, pos.line, pos.tl];
	}

	function cleanupItems(items: Item[]): Item[] {
		//only store unique items based on body
		const exist = new Set();

		return items
			.map(i => Item.fromArray(i))
			.filter(
				i => {
					if (exist.has(i.id)) return false;
					exist.add(i.id);
					return true;
				}
			);
	}



	const
		exportable_states = states.map(s => ({
			pr: s.production,
			b: s.body,
			i: s.real_id,
			act: [...s.actions.entries()].map(([s, act]) => [s, prepareAction(act)]),
			gt: [...s.goto.entries()].map(([s, act]) => [s, prepareAction(act)]),
			it: cleanupItems(s.items)
		})),
		exportable_grammar = grammar.map(p => ({
			name: p.name,
			id: p.id,
			bodies: p.bodies.map(b => ({
				name: b.name,
				sym: b.sym.map(getSymbolId),
				length: b.length,
				pos: getPos(b.lex),
			})),
			url: urls.has(p.url) ? urls.get(p.url) : (urls.set(p.url, urls.size), urls.size - 1),
		}));

	return JSON.stringify({
		//@ts-ignore
		type: states.type,
		hash: grammar.hash,
		urls: [...urls.keys()],
		symbols: symbol_array,
		states: exportable_states,
		grammar: exportable_grammar
	});
}

export function GenerateActionSequence(id: number, states: LRState[], grammar: Grammar) {
	const s = states[id];

	const build_forked_action = (e: ParserAction, i) => `${i}: ${StateActionEnum[e.name]} => state: ${e.state} production: ${new Item(e.body, grammar.bodies[e.body].length, e.offset, <Symbol>{}).renderWithProduction(grammar)}`;

	const build_action = e => (e[1].name == StateActionEnum.REDUCE)
		? (`${StateActionEnum[e[1].name]} [ ${e[0]} ] complete production: ${grammar[e[1].production].name}`) :
		(e[1].name == StateActionEnum.FORK) ? `${StateActionEnum[e[1].name]} at [ ${e[0]} ] forks: \n        ${e[1].actions.map(build_forked_action).join("\n        ")}` :
			`${StateActionEnum[e[1].name]} at [ ${e[0]} ] next state: ${e[1].state}`;

	return `state: [${s.id}]

    PRODUCTIONS:
    ${s.items.map(i => Item.fromArray(i)).map(i => (<Item>i).renderWithProduction(grammar)).join("\n    ")}
	${ (s.goto.size > 0) ?
			`\n    GOTO: 
    ${[...s.goto.entries()].map(e => `${grammar[e[0]].name} => ${e[1].state}`).join("\n    ")}` : ""}

    ACTIONS: 
    ${[...s.actions.entries()].sort(([, a], [, b]) => a.name < b.name ? -1 : 1).map(build_action).filter(e => !!e).join("\n    ")}`;
}

export function ImportStates(exported_states: string | any) {

	let data = exported_states;
	if (typeof exported_states == "string") {
		data = JSON.parse(exported_states);
	}

	return <{
		hash: string,
		states: LRState[],
		grammar: Grammar;
	}>{
			hash: data.hash || data.grammar.hash,
			states: Object.assign(data.states.map((s, i) => {
				return <LRState>{
					id: i,
					production: <number>s.p,
					body: <number>s.b,
					actions: s.act ? new Map(s.act.map(([sym, act]) => [sym, extractAction(act)])) : new Map,
					goto: s.gt ? new Map(s.gt.map(([sym, act]) => [sym, extractAction(act)])) : new Map,
					items: s.it.map(Item.fromArray)
				};
			}), { type: data.type }),
			grammar: filloutGrammar(<Grammar><unknown>(data.grammar.map(p => {
				return <Production>{
					name: p.name,
					id: p.id,
					url: data.urls[p.url],
					bodies: p.bodies.map(b => (<ProductionBody><any>{
						name: b.name,
						sym: b.sym.map(s => data.symbols[s]),
						ignore: new Map(),
						excludes: new Map(),
						error: new Map(),
						length: b.length,
						pos: b.lex,
					})),
					graph_id: p.graph_id
				};

			})), null)
		};
}


