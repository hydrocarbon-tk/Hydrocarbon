export var SymbolType;
(function (SymbolType) {
    SymbolType["PRODUCTION"] = "production";
    SymbolType["ESCLUDE"] = "exc";
    SymbolType["IGNORE"] = "ign";
    SymbolType["ERROR"] = "err";
    SymbolType["RESET"] = "rst";
    SymbolType["REDUCE"] = "red";
    SymbolType["LITERAL"] = "literal";
    SymbolType["GENERATED"] = "generated";
    SymbolType["INLINE"] = "INLINE";
    SymbolType["ESCAPED"] = "escaped";
    SymbolType["SYMBOL"] = "symbol";
    SymbolType["EMPTY"] = "empty";
    SymbolType["END_OF_FILE"] = "eof";
})(SymbolType || (SymbolType = {}));
