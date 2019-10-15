#pragma once
#include <iostream>
#include <cstring>
#include <string>
#include <unordered_map>

#ifdef assert
#undef assert
#endif

namespace HC_Tokenizer
{
	using std::wstring;
	using std::unordered_map;
	using std::wostream;
	using std::cout;
	using std::endl;

	class SymbolMap : public unordered_map<wchar_t, void *>
	{
	public:
		bool IS_SYM = false;
	};

	enum JUMP_TYPE : char {
	    NUMBER,
	    IDENTIFIER,
	    STRING,
	    SPACE,
	    TAB,
	    CARRIAGE_RETURN,
	    LINEFEED,
	    SYMBOL,
	    OPERATOR,
	    OPEN_BRACKET,
	    CLOSE_BRACKET,
	    DATA_LINK
	};

	const char JUMP_TABLE[] {
		JUMP_TYPE::SYMBOL, 	 	/* NULL */
		JUMP_TYPE::SYMBOL, 	 	/* START_OF_HEADER */
		JUMP_TYPE::SYMBOL, 	 	/* START_OF_TEXT */
		JUMP_TYPE::SYMBOL, 	 	/* END_OF_TXT */
		JUMP_TYPE::SYMBOL, 	 	/* END_OF_TRANSMISSION */
		JUMP_TYPE::SYMBOL, 	 	/* ENQUIRY */
		JUMP_TYPE::SYMBOL, 	 	/* ACKNOWLEDGE */
		JUMP_TYPE::SYMBOL, 	 	/* BELL */
		JUMP_TYPE::SYMBOL, 	 	/* BACKSPACE */
		JUMP_TYPE::TAB, 	 	/* HORIZONTAL_TAB */
		JUMP_TYPE::LINEFEED, 	 	/* LINEFEED */
		JUMP_TYPE::SYMBOL, 	 	/* VERTICAL_TAB */
		JUMP_TYPE::SYMBOL, 	 	/* FORM_FEED */
		JUMP_TYPE::CARRIAGE_RETURN, 	 	/* CARRIAGE_RETURN */
		JUMP_TYPE::SYMBOL, 	 	/* SHIFT_OUT */
		JUMP_TYPE::SYMBOL, 		/* SHIFT_IN */
		JUMP_TYPE::DATA_LINK,	 	/* DATA_LINK_ESCAPE */
		JUMP_TYPE::SYMBOL, 	 	/* DEVICE_CTRL_1 */
		JUMP_TYPE::SYMBOL, 	 	/* DEVICE_CTRL_2 */
		JUMP_TYPE::SYMBOL, 	 	/* DEVICE_CTRL_3 */
		JUMP_TYPE::SYMBOL, 	 	/* DEVICE_CTRL_4 */
		JUMP_TYPE::SYMBOL, 	 	/* NEGATIVE_ACKNOWLEDGE */
		JUMP_TYPE::SYMBOL, 	 	/* SYNCH_IDLE */
		JUMP_TYPE::SYMBOL, 	 	/* END_OF_TRANSMISSION_BLOCK */
		JUMP_TYPE::SYMBOL, 	 	/* CANCEL */
		JUMP_TYPE::SYMBOL, 	 	/* END_OF_MEDIUM */
		JUMP_TYPE::SYMBOL, 	 	/* SUBSTITUTE */
		JUMP_TYPE::SYMBOL, 	 	/* ESCAPE */
		JUMP_TYPE::SYMBOL, 	 	/* FILE_SEPERATOR */
		JUMP_TYPE::SYMBOL, 	 	/* GROUP_SEPERATOR */
		JUMP_TYPE::SYMBOL, 	 	/* RECORD_SEPERATOR */
		JUMP_TYPE::SYMBOL, 	 	/* UNIT_SEPERATOR */
		JUMP_TYPE::SPACE, 	 	/* SPACE */
		JUMP_TYPE::OPERATOR, 	 	/* EXCLAMATION */
		JUMP_TYPE::STRING, 	 	/* DOUBLE_QUOTE */
		JUMP_TYPE::SYMBOL, 	 	/* HASH */
		JUMP_TYPE::SYMBOL, 	 	/* DOLLAR */
		JUMP_TYPE::OPERATOR, 	 	/* PERCENT */
		JUMP_TYPE::OPERATOR, 	 	/* AMPERSAND */
		JUMP_TYPE::STRING, 	 	/* QUOTE */
		JUMP_TYPE::OPEN_BRACKET, 	 	/* OPEN_PARENTH */
		JUMP_TYPE::CLOSE_BRACKET, 	 /* CLOSE_PARENTH */
		JUMP_TYPE::OPERATOR, 	 	/* ASTERISK */
		JUMP_TYPE::OPERATOR, 	 	/* PLUS */
		JUMP_TYPE::SYMBOL, 	 	/* COMMA */
		JUMP_TYPE::SYMBOL, 	 	/* HYPHEN */
		JUMP_TYPE::SYMBOL, 	 	/* PERIOD */
		JUMP_TYPE::SYMBOL, 	 	/* FORWARD_SLASH */
		JUMP_TYPE::NUMBER, 	 	/* ZERO */
		JUMP_TYPE::NUMBER, 	 	/* ONE */
		JUMP_TYPE::NUMBER, 	 	/* TWO */
		JUMP_TYPE::NUMBER, 	 	/* THREE */
		JUMP_TYPE::NUMBER, 	 	/* FOUR */
		JUMP_TYPE::NUMBER, 	 	/* FIVE */
		JUMP_TYPE::NUMBER, 	 	/* SIX */
		JUMP_TYPE::NUMBER, 	 	/* SEVEN */
		JUMP_TYPE::NUMBER, 	 	/* EIGHT */
		JUMP_TYPE::NUMBER, 	 	/* NINE */
		JUMP_TYPE::OPERATOR, 	 	/* COLON */
		JUMP_TYPE::SYMBOL, 	 	/* SEMICOLON */
		JUMP_TYPE::OPERATOR, 	 	/* LESS_THAN */
		JUMP_TYPE::OPERATOR, 	 	/* EQUAL */
		JUMP_TYPE::OPERATOR, 	 	/* GREATER_THAN */
		JUMP_TYPE::SYMBOL, 	 	/* QMARK */
		JUMP_TYPE::SYMBOL, 	 	/* AT */
		JUMP_TYPE::IDENTIFIER, 	 	/* A*/
		JUMP_TYPE::IDENTIFIER, 	 	/* B */
		JUMP_TYPE::IDENTIFIER, 	 	/* C */
		JUMP_TYPE::IDENTIFIER, 	 	/* D */
		JUMP_TYPE::IDENTIFIER, 	 	/* E */
		JUMP_TYPE::IDENTIFIER, 	 	/* F */
		JUMP_TYPE::IDENTIFIER, 	 	/* G */
		JUMP_TYPE::IDENTIFIER, 	 	/* H */
		JUMP_TYPE::IDENTIFIER, 	 	/* I */
		JUMP_TYPE::IDENTIFIER, 	 	/* J */
		JUMP_TYPE::IDENTIFIER, 	 	/* K */
		JUMP_TYPE::IDENTIFIER, 	 	/* L */
		JUMP_TYPE::IDENTIFIER, 	 	/* M */
		JUMP_TYPE::IDENTIFIER, 	 	/* N */
		JUMP_TYPE::IDENTIFIER, 	 	/* O */
		JUMP_TYPE::IDENTIFIER, 	 	/* P */
		JUMP_TYPE::IDENTIFIER, 	 	/* Q */
		JUMP_TYPE::IDENTIFIER, 	 	/* R */
		JUMP_TYPE::IDENTIFIER, 	 	/* S */
		JUMP_TYPE::IDENTIFIER, 	 	/* T */
		JUMP_TYPE::IDENTIFIER, 	 	/* U */
		JUMP_TYPE::IDENTIFIER, 	 	/* V */
		JUMP_TYPE::IDENTIFIER, 	 	/* W */
		JUMP_TYPE::IDENTIFIER, 	 	/* X */
		JUMP_TYPE::IDENTIFIER, 	 	/* Y */
		JUMP_TYPE::IDENTIFIER, 	 	/* Z */
		JUMP_TYPE::OPEN_BRACKET, 	 	/* OPEN_SQUARE */
		JUMP_TYPE::SYMBOL, 	 	/* TILDE */
		JUMP_TYPE::CLOSE_BRACKET, 	/* CLOSE_SQUARE */
		JUMP_TYPE::SYMBOL, 	 	/* CARET */
		JUMP_TYPE::SYMBOL, 	 	/* UNDER_SCORE */
		JUMP_TYPE::STRING, 	 	/* GRAVE */
		JUMP_TYPE::IDENTIFIER, 	 	/* a */
		JUMP_TYPE::IDENTIFIER, 	 	/* b */
		JUMP_TYPE::IDENTIFIER, 	 	/* c */
		JUMP_TYPE::IDENTIFIER, 	 	/* d */
		JUMP_TYPE::IDENTIFIER, 	 	/* e */
		JUMP_TYPE::IDENTIFIER, 	 	/* f */
		JUMP_TYPE::IDENTIFIER, 	 	/* g */
		JUMP_TYPE::IDENTIFIER, 	 	/* h */
		JUMP_TYPE::IDENTIFIER, 	 	/* i */
		JUMP_TYPE::IDENTIFIER, 	 	/* j */
		JUMP_TYPE::IDENTIFIER, 	 	/* k */
		JUMP_TYPE::IDENTIFIER, 	 	/* l */
		JUMP_TYPE::IDENTIFIER, 	 	/* m */
		JUMP_TYPE::IDENTIFIER, 	 	/* n */
		JUMP_TYPE::IDENTIFIER, 	 	/* o */
		JUMP_TYPE::IDENTIFIER, 	 	/* p */
		JUMP_TYPE::IDENTIFIER, 	 	/* q */
		JUMP_TYPE::IDENTIFIER, 	 	/* r */
		JUMP_TYPE::IDENTIFIER, 	 	/* s */
		JUMP_TYPE::IDENTIFIER, 	 	/* t */
		JUMP_TYPE::IDENTIFIER, 	 	/* u */
		JUMP_TYPE::IDENTIFIER, 	 	/* v */
		JUMP_TYPE::IDENTIFIER, 	 	/* w */
		JUMP_TYPE::IDENTIFIER, 	 	/* x */
		JUMP_TYPE::IDENTIFIER, 	 	/* y */
		JUMP_TYPE::IDENTIFIER, 	 	/* z */
		JUMP_TYPE::OPEN_BRACKET, 	 	/* OPEN_CURLY */
		JUMP_TYPE::SYMBOL, 	 	/* VERTICAL_BAR */
		JUMP_TYPE::CLOSE_BRACKET,  	/* CLOSE_CURLY */
		JUMP_TYPE::SYMBOL,  	/* TILDE */
		JUMP_TYPE::SYMBOL 		/* DELETE */
	};

	/**
	 * Lexer Number and Identifier jump table reference
	 * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
	 * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
	 * entries marked as `2` are in the identifier set but not the number set
	 * entries marked as `4` are in the number set but not the identifier set
	 * entries marked as `8` are in both number and identifier sets
	 */
	const char number_and_identifier_table[] {
		0, 		/* NULL */
		0, 		/* START_OF_HEADER */
		0, 		/* START_OF_TEXT */
		0, 		/* END_OF_TXT */
		0, 		/* END_OF_TRANSMISSION */
		0, 		/* ENQUIRY */
		0,		/* ACKNOWLEDGE */
		0,		/* BELL */
		0,		/* BACKSPACE */
		0,		/* HORIZONTAL_TAB */
		0,		/* LINEFEED */
		0,		/* VERTICAL_TAB */
		0,		/* FORM_FEED */
		0,		/* CARRIAGE_RETURN */
		0,		/* SHIFT_OUT */
		0,		/* SHIFT_IN */
		0,		/* DATA_LINK_ESCAPE */
		0,		/* DEVICE_CTRL_1 */
		0,		/* DEVICE_CTRL_2 */
		0,		/* DEVICE_CTRL_3 */
		0,		/* DEVICE_CTRL_4 */
		0,		/* NEGATIVE_ACKNOWLEDGE */
		0,		/* SYNCH_IDLE */
		0,		/* END_OF_TRANSMISSION_BLOCK */
		0,		/* CANCEL */
		0,		/* END_OF_MEDIUM */
		0,		/* SUBSTITUTE */
		0,		/* ESCAPE */
		0,		/* FILE_SEPERATOR */
		0,		/* GROUP_SEPERATOR */
		0,		/* RECORD_SEPERATOR */
		0,		/* UNIT_SEPERATOR */
		0,		/* SPACE */
		0,		/* EXCLAMATION */
		0,		/* DOUBLE_QUOTE */
		0,		/* HASH */
		0,		/* DOLLAR */
		0,		/* PERCENT */
		0,		/* AMPERSAND */
		0,		/* QUOTE */
		0,		/* OPEN_PARENTH */
		0,		 /* CLOSE_PARENTH */
		0,		/* ASTERISK */
		0,		/* PLUS */
		0,		/* COMMA */
		0,		/* HYPHEN */
		4,		/* PERIOD */
		0,		/* FORWARD_SLASH */
		8,		/* ZERO */
		8,		/* ONE */
		8,		/* TWO */
		8,		/* THREE */
		8,		/* FOUR */
		8,		/* FIVE */
		8,		/* SIX */
		8,		/* SEVEN */
		8,		/* EIGHT */
		8,		/* NINE */
		0,		/* COLON */
		0,		/* SEMICOLON */
		0,		/* LESS_THAN */
		0,		/* EQUAL */
		0,		/* GREATER_THAN */
		0,		/* QMARK */
		0,		/* AT */
		2,		/* A*/
		8,		/* B */
		2,		/* C */
		2,		/* D */
		8,		/* E */
		2,		/* F */
		2,		/* G */
		2,		/* H */
		2,		/* I */
		2,		/* J */
		2,		/* K */
		2,		/* L */
		2,		/* M */
		2,		/* N */
		8,		/* O */
		2,		/* P */
		2,		/* Q */
		2,		/* R */
		2,		/* S */
		2,		/* T */
		2,		/* U */
		2,		/* V */
		2,		/* W */
		8,		/* X */
		2,		/* Y */
		2,		/* Z */
		0,		/* OPEN_SQUARE */
		0,		/* TILDE */
		0,		/* CLOSE_SQUARE */
		0,		/* CARET */
		0,		/* UNDER_SCORE */
		0,		/* GRAVE */
		2,		/* a */
		8,		/* b */
		2,		/* c */
		2,		/* d */
		2,		/* e */
		2,		/* f */
		2,		/* g */
		2,		/* h */
		2,		/* i */
		2,		/* j */
		2,		/* k */
		2,		/* l */
		2,		/* m */
		2,		/* n */
		8,		/* o */
		2,		/* p */
		2,		/* q */
		2,		/* r */
		2,		/* s */
		2,		/* t */
		2,		/* u */
		2,		/* v */
		2,		/* w */
		8,		/* x */
		2,		/* y */
		2,		/* z */
		0,		/* OPEN_CURLY */
		0,		/* VERTICAL_BAR */
		0,		/* CLOSE_CURLY */
		0,		/* TILDE */
		0		/* DELETE */
	};

	enum class TYPE : unsigned
	{
	    NUMBER = 1,
	    NUM = 1,
	    IDENTIFIER = 2,
	    ID = 2,
	    STRING = 4,
	    STR = 4,
	    WHITE_SPACE = 8,
	    WS = 8,
	    OPEN_BRACKET = 16,
	    OB= 16,
	    CLOSE_BRACKET = 32,
	    CB= 32,
	    OPERATOR = 64,
	    OP= 64,
	    SYMBOL = 128,
	    SYM= 128,
	    NEW_LINE = 256,
	    NL= 256,
	    DATA_LINK = 512,
	    DL =512,
	    UNDEFINED = 32768
	};

	class Token
	{
	private:

		void * custom_symbols = NULL;

	public:

		const wstring & string;

		unsigned offset = 0;

		unsigned string_length = 0;

		unsigned chr = 0;

		unsigned line = 0;

		unsigned length = 0;

		TYPE type = TYPE::UNDEFINED;

		bool END = false;
		bool IGNORE_WHITE_SPACE = false;
		bool PARSE_STRING = false;
		bool CHARACTERS_ONLY = false;
		bool CLONED = false;

	public:

		Token(const wstring& s, bool PEEKING = false) : string(s) {

			string_length = string.length();

			if(!PEEKING) next();
		}

		Token(const Token& token) : string(token.string) {
			CLONED = true;
			sync(token);
		}

		~Token() {
			if(!CLONED && custom_symbols != NULL) {
				delete (SymbolMap *) custom_symbols;
			}
		}

		friend wostream& operator<<(wostream& os, const Token& tk) {
			return os << tk.text();
		}

		void addSymbol(wstring sym) {

			if(!custom_symbols)
				custom_symbols = (void *) new SymbolMap;

			SymbolMap * sm = (SymbolMap *) custom_symbols;

			for (auto i = 0; i < sym.length(); i++) {
				wchar_t code = sym[i];

				auto iter = sm->find(code);

				if (iter == sm->end()) {
					SymbolMap * nm = new SymbolMap;

					sm->insert( {code, (void *) nm});

					sm = nm;
				} else {
					sm = (SymbolMap *) iter->second;
				}
			}

			sm->IS_SYM = true;
		}

		void sync(const Token& token) {
			if(token.string != string) return;

			offset = token.offset;
			string_length = token.string_length;
			END = token.END;
			type = token.type;
			line = token.line;
			chr = token.chr;
			length = token.length;
			IGNORE_WHITE_SPACE = token.IGNORE_WHITE_SPACE;
			PARSE_STRING = token.PARSE_STRING;
			CHARACTERS_ONLY = token.CHARACTERS_ONLY;
		}

		wstring text() const {
			return string.substr(offset, length);
		}

		bool assert(wstring& str) {
			if(offset < 0) return false;

			if(str.compare(offset, length, string) != 0) return false;

			next();

			return true;
		}

		bool assertCharacter(wchar_t c) {
			if(offset < 0) return false;

			if(c != string[offset]) return false;

			next();

			return true;
		}

		wstring slice(unsigned start = 41923685) {

			if(start == 41923685)
				start = offset;

			return string.substr(start, string_length - start);
		}

		wstring slice(const Token& token) {
			return string.substr(token.offset, offset < token.offset ? string_length - token.offset : string_length - offset);
		}

		Token& reset() {
			type = TYPE::UNDEFINED;
			offset = 0;
			END = false;
			length = 0;
			chr = 0;
			line = 0;
			next();
			return *this;
		}

		Token& next(Token* mk = NULL, bool USE_CUSTOM_SYMBOLS = true) {

			if(mk == NULL)
				mk = this;

			Token& marker = *mk;

			if(marker.string_length < 1) {
				marker.offset = 0;
				marker.type = TYPE::UNDEFINED;
				marker.END = true;
				marker.length = 0;
				marker.chr = 0;
				marker.line = 0;
				return marker;
			}

			unsigned const int string_length = marker.string_length;

			const wstring& string = marker.string;

			bool NORMAL_PARSE = true, IGNORE_WHITE_SPACE = marker.IGNORE_WHITE_SPACE;

			unsigned length = marker.length,
			         offset = marker.offset + length,
			         line = marker.line,
			         base = offset,
			         chr = marker.chr,
			         root = marker.offset;

			TYPE type = TYPE::SYMBOL;

			if(USE_CUSTOM_SYMBOLS && marker.custom_symbols != NULL) {

				wchar_t code = string[offset];

				int offset2 = offset;

				SymbolMap * map = (SymbolMap *) custom_symbols;

				while (
				    code == 32
				    && IGNORE_WHITE_SPACE
				    && offset < string_length
				) {
					code = string[++offset2];
					offset++;
				}

				if(offset >= string_length)
					goto end;

				auto iter = map->find(code);

				while (iter != map->end()) {
					map = (SymbolMap *) iter->second;
					offset2++;
					iter = map->find(string[offset2]);
				}

				if (map->IS_SYM) {
					NORMAL_PARSE = false;
					base = offset;
					length = offset2 - offset;
				}
			}

end:

			if(offset >= string_length) {
				marker.offset = string_length;
				marker.type = TYPE::UNDEFINED;
				marker.length = 0;
				marker.chr = chr + base - marker.offset;
				marker.line = line;
				marker.END = true;
				return marker;
			}


			while(NORMAL_PARSE) {


				base = offset;

				length = 1;

				wchar_t code = string[offset];

				if(code < 128) {
					switch(JUMP_TABLE[code]) {
						case JUMP_TYPE::NUMBER:
							while
							(
							    ++offset < string_length
							    && ((code = string[offset]) < 128)
							    && (12 & number_and_identifier_table[code])
							);

							if(
							    (code == L'e' || code == L'E')
							    && number_and_identifier_table[code]
							) {
								offset++;
								if(string[offset] == L'-') offset++;
								marker.offset = offset;
								marker.length = 0;
								marker.next();
								offset = marker.offset + marker.length;
							}

							type = TYPE::NUMBER;
							length = offset - base;
							break;
						case JUMP_TYPE::IDENTIFIER:
							while
							(
							    ++offset < string_length
							    && ((code = string[offset]) < 128)
							    && (10 & number_and_identifier_table[code])
							);
							type = TYPE::IDENTIFIER;
							length = offset - base;

							break;
						case JUMP_TYPE::STRING:
							if(!marker.PARSE_STRING) {
								while
								(
								    ++offset < string_length
								    && (code != string[offset])
								);

								type = TYPE::STRING;
								length = offset - base + 1;
							}
							break;
						case JUMP_TYPE::SPACE:
							while
							(
							    ++offset < string_length
							    && (code == string[offset])
							);
							type = TYPE::WHITE_SPACE;
							length = offset - base;
							break;
						case JUMP_TYPE::TAB:
							while
							(
							    ++offset < string_length
							    && (L'\t' != string[offset])
							);
							type = TYPE::WHITE_SPACE;
							length = offset - base;
							break;
						case JUMP_TYPE::CARRIAGE_RETURN:
							length = 2;
							//Intentional
						case JUMP_TYPE::LINEFEED:
							type = TYPE::NEW_LINE;
							line++;
							base = offset;
							root = offset;
							offset += length;
							chr = 0;
							break;
						case JUMP_TYPE::SYMBOL:
							break;
						case JUMP_TYPE::OPERATOR:
							type = TYPE::OPERATOR;
							break;
						case JUMP_TYPE::OPEN_BRACKET:
							type = TYPE::OPEN_BRACKET;
							break;
						case JUMP_TYPE::CLOSE_BRACKET:
							type = TYPE::CLOSE_BRACKET;
							break;
							/*
							case JUMP_TYPE::DATA_LINK:
								type = TYPE::DATA_LINK;
							break;
							*/
					}
				} else break;

				if(IGNORE_WHITE_SPACE && ((unsigned)type & ((unsigned)TYPE::WHITE_SPACE | (unsigned)TYPE::NEW_LINE))) {

					if(offset < string_length) {
						type = TYPE::SYMBOL;
						continue;
					}
				}

				break;
			}

			marker.type = type;
			marker.offset = base;
			marker.length = (CHARACTERS_ONLY)
                ? (length == 0) ? 0 : 1 : length;
			marker.chr = chr  + base - root;
			marker.line = line;

			return marker;
		}
	};

}
