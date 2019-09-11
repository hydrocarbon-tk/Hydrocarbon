#pragma once

#include  "./tokenizer.h"
#include  "./parse_buffer.h"
#include <stdlib.h>
#include <unordered_map>

namespace HC_Parser
{
	using std::unordered_map;
	using std::wostream;
	using std::wstring;
	using std::endl;
	using std::wcout;
	using std::cout;

	using HC_Tokenizer::Token;
	using HC_Tokenizer::TYPE;

	typedef unordered_map<wstring, unsigned> SymbolLookup;
	typedef int(*StateAction)(Token&, int&, void **, void *);
	typedef int(*ErrorAction)(Token&, unsigned, void **);
	typedef void * (* Action)(Token&, unsigned, int, void **, void *);

	enum class TOKEN_STATE
	{
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

	int getLookUpValue(wstring str, const SymbolLookup& sym_lu);

	int getToken(Token& tk, const SymbolLookup& sym_lu);

	template <class Allocator>
	void parseRunner(
	    Allocator* buffer,
	    Token& tk,
	    const SymbolLookup& sym_lu,
	    const int * state_table[],
	    const int * goto_lu[],
	    const StateAction * state_actions,
	    const ErrorAction * error_actions
	)
	{

		void * output[100];

		unsigned active_states[100];

		int
		state_pointer = 0,
		token_index = getToken(tk, sym_lu),
		action = 0,
		offset = 0,
		output_offset = 0,
		RECOVERING = 100,
		index  = 0;

		output[0] = nullptr;

		active_states[0] = 0;

		while (index++ < 10000) {

			if (state_pointer >= 100) throw ParseErrorCode::MaxStatePointerReached;

			if (token_index < 0) throw ParseErrorCode::InvalidToken;

			int state = state_table[active_states[state_pointer]][token_index];

			if (state == 0) {
				tk.next();
				token_index = getToken(tk, sym_lu);
				continue;
			} else if (state > 0) {
				action = (state_actions[state - 1])(tk, output_offset, output, buffer);
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

			switch (action & 3) {
				case 0:

					throw ParseErrorCode::ErrorStateReached;
					break;
				case 1: //ACCEPT

					goto complete;
				case 2: //SHIFT

					output_offset++;

					output[output_offset] = (void *)(unsigned long long) offset;

					state_pointer++;

					active_states[state_pointer] = action >> 2;

					tk.next();

					offset = tk.offset;

					token_index = getToken(tk, sym_lu);

					RECOVERING++;

					break;
				case 3: //REDUCE
					state_pointer -= (action & 0x3FC) >> 2;

					int goto_state = goto_lu[active_states[state_pointer]][(action >> 10)];

					if (goto_state < 0)
						throw ParseErrorCode::InvalidGotoState;

					state_pointer++;

					active_states[state_pointer] = goto_state;

					break;
			}
		}

		if (tk.END)
			throw ParseErrorCode::UnexpectedEndOfOutput;

complete:
		buffer->setRootObject(output[1]);

		return;
	};


	/**
		Sets up buffer and runs checks before running the parser.
		Handles parser exceptions. Deconstructs buffer and isses a
		void buffer if necessary.
	**/
	template <class Allocator, class Data>
	Allocator parse(
	    Token& tk,
	    wostream& os = std::wcout
	)
	{

		tk.IGNORE_WHITE_SPACE = false;

		tk.reset();

		try {

			Allocator buffer(8192);

			parseRunner<Allocator>(&buffer, tk, Data::symbol_lu, Data::state_lookup, Data::goto_lookup, Data::state_actions, Data::error_actions);

			return buffer;

		} catch (ParseErrorCode error_code) {
			switch (error_code) {

				case ParseErrorCode::InvalidToken:
					os << "Parse error: " << (unsigned) ParseErrorCode::InvalidToken << endl;
					break;
				case ParseErrorCode::ErrorStateReached:
					os << "Parse error: " << (unsigned) ParseErrorCode::ErrorStateReached << endl;
					break;
				case ParseErrorCode::InvalidGotoState:
					os << "Parse error: " << (unsigned) ParseErrorCode::InvalidGotoState << endl;
					break;
				case ParseErrorCode::UnexpectedEndOfOutput:
					os << "Parse error: " << (unsigned) ParseErrorCode::UnexpectedEndOfOutput << endl;
					break;
				case ParseErrorCode::CannotAllocateBuffer:
					os << "Parse error: " << (unsigned) ParseErrorCode::CannotAllocateBuffer << endl;
					break;
				case ParseErrorCode::CannotAllocateSpace:
					os << "Parse error: " << (unsigned) ParseErrorCode::CannotAllocateSpace << endl;
					break;
				case ParseErrorCode::MaxStatePointerReached:
					os << "Parse error: " << (unsigned) ParseErrorCode::MaxStatePointerReached << endl;
					break;
			}
		}

		return Allocator(0);
	}
}
