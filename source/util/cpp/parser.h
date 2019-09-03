#pragma once
#include  "./tokenizer.h"

namespace HC_Parser {

using HC_Tokenizer::Token;
using HC_Tokenizer::TYPE;

typedef unordered_map<wstring, unsigned> SymbolLookup;
typedef int(*StateAction)(Token&, int&, void **);
typedef int(*ErrorAction)(Token&, unsigned, void **);
typedef void * (* Action)(Token&, unsigned, int, void **);

enum class TOKEN_STATE {
	NUMBER = 1,
	IDENTIFIER = 2,
	STRING = 3,
	WHITE_SPACE = 4,
	SYMBOL = 8,
	NEW_LINE = 9,
	DATA_LINK = 10,
	ANY = 13,
	KEYWORD = 14
};

int getLookUpValue(wstring str, const SymbolLookup& sym_lu) {

	auto got = sym_lu.find(str);

	if (got != sym_lu.end())
		return got->second;

	return -1;
};

int getToken(Token& tk, const SymbolLookup& sym_lu) {

	if (tk.END) return 0;

	cout << (unsigned)tk.type << endl;
	switch (tk.type) {
	case TYPE::IDENTIFIER: {

		auto got = sym_lu.find(tk.text());

		if (got != sym_lu.end())
			return 14;

		return (int)TOKEN_STATE::IDENTIFIER;
	}
	case TYPE::NUMBER: {
		return (int)TOKEN_STATE::NUMBER;
	}
	case TYPE::STRING: {
		return (int)TOKEN_STATE::STRING;
	}
	case TYPE::NEW_LINE: {
		return (int)TOKEN_STATE::NEW_LINE;
	}
	case TYPE::WHITE_SPACE: {
		return  (int)TOKEN_STATE::WHITE_SPACE;
	}
	case TYPE::DATA_LINK: {
		return (int)TOKEN_STATE::DATA_LINK;
	}
	default: {
		auto v = getLookUpValue(tk.text(), sym_lu);

		if (v > -1)
			return v;

		return getLookUpValue(wstring(1, (wchar_t) (0xF00000 | (unsigned) tk.type)), sym_lu);
	}
	}
};

void * parse(
    Token& tk,
    const SymbolLookup& sym_lu,
    int * state_table[],
    int * goto_lu[],
    const StateAction * state_actions,
    const ErrorAction * error_actions
)
{
	void * output[100];

	unsigned active_states[100];

	output[0] = 0;

	active_states[0] = 0;
	active_states[1] = 0;

	int
	state_pointer = 1,
	token_index = getToken(tk, sym_lu),
	action = 0,
	offset = 0,
	output_offset = 0,
	RECOVERING = 100,

	index  = 0;

	while (index++ < 10000) {

		cout << endl << "==========================================" << endl;

		if (token_index < 0) {
			throw 101;
		}

		wcout << L"Token Text " << tk << L" ti " << token_index <<  L" Offset " << tk.offset << endl ;
		//cout << "State Pointe " << state_pointer << endl;
		cout << "Active State " <<  active_states[state_pointer] << endl;

		int state = state_table[active_states[state_pointer]][token_index];

		//wcout << L"State Next " << state << endl;
		//wcout << L"State pointer " << state_pointer << endl;
		//wcout << L"tk Index " << token_index << endl;
		//wcout << L"State Lookup " << state << endl;

		if (state == 0) {
			//cout << "SKIPPING --" << endl;
			tk.next();
			token_index = getToken(tk, sym_lu);
			continue;
		} else if (state > 0) {
			action = (state_actions[state - 1])(tk, output_offset, output);
		} else {
			//Error Recovery
			if (token_index == (int)TOKEN_STATE::KEYWORD) {
				token_index = getLookUpValue(tk.text(), sym_lu);
				continue;
			}

			if (tk.type == TYPE::SYMBOL && tk.length > 1) {
				tk.length = 0;
				tk.next(&tk, false);
				if (tk.length == 1)
					continue;
			}
			//	cout <<"---------------SDDFSDFSDF----------- " << RECOVERING << endl;

			if (RECOVERING > 1 && !tk.END) {
				if (token_index != getLookUpValue(wstring(1, (wchar_t) (0xF00000 | (unsigned) tk.type)), sym_lu)) {
					token_index = getLookUpValue(wstring(1, (wchar_t) (0xF00000 | (unsigned) tk.type)), sym_lu);
					continue;
				}

				if (token_index != (int)TOKEN_STATE::ANY) {
					token_index = (int)TOKEN_STATE::ANY;
					RECOVERING = 1;
					continue;
				}
			}

			token_index = getToken(tk, sym_lu);

			int recovery_token = -1;

			if (RECOVERING > 0 && recovery_token >= 0) {
				RECOVERING = -1;
				token_index = recovery_token;
				tk.length = 0;
				continue;
			}

			throw 104;
		}

		wcout << L"State Action " << (action & 3) << endl;

		switch (action & 3) {
		case 0:
			throw 104;
			break;
		case 1: //ACCEPT
			goto complete;
		case 2: //SHIFT
			output_offset++;
			output[output_offset] = (void *)(unsigned long long) offset;
			state_pointer += 2;
			active_states[state_pointer - 1] = offset;
			active_states[state_pointer] = action >> 2;
			tk.next();
			offset = tk.offset;
			token_index = getToken(tk, sym_lu);
			RECOVERING++;
			break;
		case 3: //REDUCE
			state_pointer -= (action & 0x3FC) >> 1;

			int goto_state = goto_lu[active_states[state_pointer]][(action >> 10)];

			if (goto_state < 0)
				throw 102;

			cout << "REduce " << ((action & 0x3FC) >> 1) << " "  << goto_state << endl;

			state_pointer += 2;
			//active_states[state_pointer - 1] = offset;
			active_states[state_pointer] = goto_state;
			break;
		}
	}

	if (tk.END)
		throw 103;

complete:

	return output[1];
};
}
