#include "./parser.h"

int HC_Parser::getLookUpValue(wstring str, const SymbolLookup& sym_lu)
{

	auto got = sym_lu.find(str);

	if (got != sym_lu.end())
		return got->second;

	return -1;
};

int HC_Parser::getToken(Token& tk, const SymbolLookup& sym_lu)
{

	if (tk.END) return 0;

	switch (tk.type) {
		case TYPE::IDENTIFIER: {


				auto got = sym_lu.find(tk.text());

				if (got != sym_lu.end())
					return (int)TOKEN_STATE::KEYWORD;
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
