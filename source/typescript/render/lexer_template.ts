import { SC } from "../utilities/skribble.js";

export const createLexerCode = (): SC => {
    const strCodePointAt = SC.Member("str", "codePointAt");
    return (new SC).addStatement(
        SC.Function(
            "getTypeAt:unsigned int",
            "code_point:unsigned int"
        ).addStatement(
            SC.Switch(
                SC.Binary(SC.Call(
                    SC.Constant("load:unsigned short", ":unsigned short"),
                    SC.Binary(SC.Constant("code_point"), "<<", 1)),
                    "&", 255
                )
            ).addStatement(
                SC.If(SC.Value("default")),
                SC.If(SC.Value(0)).addStatement(SC.UnaryPre(SC.Return, SC.Constant("TokenSymbol"))),
                SC.If(SC.Value(1)).addStatement(SC.UnaryPre(SC.Return, SC.Constant("TokenIdentifier"))),
                SC.If(SC.Value(2)).addStatement(SC.UnaryPre(SC.Return, SC.Constant("TokenSpace"))),
                SC.If(SC.Value(3)),
                SC.If(SC.Value(4)).addStatement(SC.UnaryPre(SC.Return, SC.Constant("TokenNewLine"))),
                SC.If(SC.Value(5)).addStatement(SC.UnaryPre(SC.Return, SC.Constant("TokenNumber"))),
            ),
            SC.UnaryPre(SC.Return, SC.Value(0))
        ),
        SC.Class(
            "Lexer"
        ).addStatement(
            SC.Declare(
                SC.Variable("ty:int"),
                SC.Variable("tl:int"),
                SC.Variable("off:int"),
                SC.Variable("utf:int"),
                SC.Variable("prev_off:int")
            ),
            SC.Function(
                "constructor"
            ).addStatement(
                SC.Assignment(SC.Member(SC.This(), "ty"), 0),
                SC.Assignment(SC.Member(SC.This(), "tl"), 0),
                SC.Assignment(SC.Member(SC.This(), "off"), 0),
                SC.Assignment(SC.Member(SC.This(), "utf"), 0),
                SC.Assignment(SC.Member(SC.This(), "prev_off"), 0)
            ),
            SC.Function(
                "copy:Lexer&",
                SC.Assignment("destination:Lexer&", SC.UnaryPre("new", SC.Call("Lexer")))
            ).addStatement(
                SC.Assignment(SC.Member("destination", "utf"), SC.Member(SC.This(), "utf")),
                SC.Assignment(SC.Member("destination", "ty"), SC.Member(SC.This(), "ty")),
                SC.Assignment(SC.Member("destination", "tl"), SC.Member(SC.This(), "tl")),
                SC.Assignment(SC.Member("destination", "off"), SC.Member(SC.This(), "off")),
                SC.Assignment(SC.Member("destination", "prev_off"), SC.Member(SC.This(), "prev_off")),
                SC.UnaryPre(SC.Return, SC.Constant("destination"))
            ),
            SC.Function(
                "sync:void",
                SC.Assignment("marker:Lexer", SC.UnaryPre("new", SC.Call("Lexer")))
            ).addStatement(
                SC.Call(SC.Member("marker", "copy"), SC.This())
            ),
            SC.Function(
                "isSym:bool"
            ).addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Member(SC.This(), "ty"), "==", SC.Constant("TokenSymbol")))
            ),
            SC.Function(
                "isNL:bool"
            ).addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Member(SC.This(), "ty"), "==", SC.Constant("TokenNewLine")))
            ),
            SC.Function(
                "isSP:bool"
            ).addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Member(SC.This(), "ty"), "==", SC.Constant("TokenSpace")))
            ),
            SC.Function(
                "isNum:bool"
            ).addStatement(
                SC.If(
                    SC.Binary(SC.Member(SC.This(), "ty"), "==", SC.Constant("TokenNumber"))
                ).addStatement(
                    SC.Call(SC.Member(SC.This(), "consumeNumeric")),
                    SC.UnaryPre(SC.Return, SC.True)
                ),
                SC.UnaryPre(SC.Return, SC.False)
            ),
            SC.Function(
                "isID:bool"
            ).addStatement(
                SC.If(
                    SC.Binary(SC.Member(SC.This(), "ty"), "==", SC.Constant("TokenIdentifier"))
                ).addStatement(
                    SC.Call(SC.Member(SC.This(), "consumeIdentifier")),
                    SC.UnaryPre(SC.Return, SC.True)
                ),
                SC.UnaryPre(SC.Return, SC.False)
            ),
            SC.Function(
                "typeIs:bool",
                "flag:int"
            ).addStatement(
                SC.UnaryPre(
                    SC.Return, SC.Binary(
                        SC.Binary(SC.Member(SC.This(), "ty"), "&", SC.Constant("flag")), "==", SC.Member(SC.This(), "ty")
                    )
                )
            ),
            SC.Function(
                "consumeNumeric:void",
            ).addStatement(
                SC.Declare(
                    SC.Assignment(SC.Constant("l:int"), SC.Member("str", "length")),
                    SC.Assignment("off:int", SC.Member(SC.This(), "off"))
                ),
                SC.Assignment(SC.Member(SC.This(), "tl"), 1),
                SC.While(SC.Binary(SC.Binary(SC.UnaryPre("++", SC.Variable("off")), "<", "l"), "&&",
                    SC.Binary("num",
                        "&", SC.Binary(
                            SC.Call(SC.Constant("load", ":unsigned short"), SC.Binary(
                                0,
                                "+",
                                SC.Binary(
                                    SC.Call(
                                        SC.Member("str", "codePointAt"), "off"),
                                    "<<", 1))),
                            ">>", 8))
                )).addStatement(SC.UnaryPost(SC.Member(SC.This(), "tl"), "++"))
            ),
            SC.Function(
                "consumeIdentifier:void",
            ).addStatement(
                SC.Declare(
                    SC.Assignment(SC.Constant("l:int"), SC.Member("str", "length")),
                    SC.Assignment("off:int", SC.Member(SC.This(), "off"))
                ),
                SC.Assignment(SC.Member(SC.This(), "tl"), 1),
                SC.While(SC.Binary(SC.Binary(SC.UnaryPre("++", SC.Variable("off")), "<", "l"), "&&",
                    SC.Binary(SC.Binary("num", "|", "id"),
                        "&", SC.Binary(
                            SC.Call(SC.Constant("load", ":unsigned short"), SC.Binary(
                                0,
                                "+",
                                SC.Binary(
                                    SC.Call(
                                        SC.Member("str", "codePointAt"), "off"),
                                    "<<", 1))),
                            ">>", 8))
                )).addStatement(SC.UnaryPost(SC.Member(SC.This(), "tl"), "++"))
            ),
            SC.Function(
                "getUTF:unsigned int",
                SC.Assignment("delta:int", 0)
            ).addStatement(
                SC.UnaryPre(
                    SC.Return, SC.Call(
                        strCodePointAt,
                        SC.Binary(SC.Member(SC.This(), "off"), "+", "delta")
                    )
                )
            ),
            SC.Function(
                "getOffsetRegionDelta:unsigned int"
            ).addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Member(SC.This(), "off"), "-", SC.Member(SC.This(), "prev_off")))
            ),
            SC.Function(
                "advanceOffsetRegion:void"
            ).addStatement(
                SC.Assignment(SC.Member(SC.This(), "prev_off"), SC.Binary(SC.Member(SC.This(), "off"), "+", SC.Member(SC.This(), "tl")))
            ),
            SC.Function(
                "syncOffsetRegion:void"
            ).addStatement(
                SC.Assignment(SC.Member(SC.This(), "prev_off"), SC.Member(SC.This(), "off"))
            ),
            SC.Function(
                "typeAt:int",
                SC.Assignment("offset:int", 0)
            ).addStatement(
                SC.Assignment("offset", SC.Binary(SC.Member(SC.This(), "off"), "+", "offset")),
                SC.If(SC.Binary("offset", ">=", SC.Member("str", "length"))).addStatement(SC.UnaryPre(SC.Return, SC.Value(0))),
                SC.UnaryPre(SC.Return, SC.Call("getTypeAt", SC.Call(strCodePointAt, "offset")))
            ),
            SC.Function(
                "next:Lexer&"
            ).addStatement(
                SC.Assignment(SC.Member(SC.This(), "off"), SC.Binary(SC.Member(SC.This(), "off"), "+", SC.Member(SC.This(), "tl"))),
                SC.Assignment(SC.Member(SC.This(), "tl"), 1),
                SC.If(
                    SC.Binary(SC.Member(SC.This(), "off"), ">=", SC.Member("str", "length"))
                ).addStatement(
                    SC.Assignment(SC.Member(SC.This(), "ty"), 0),
                    SC.Assignment(SC.Member(SC.This(), "tl"), 0),
                    SC.Assignment(SC.Member(SC.This(), "utf"), -1),
                    SC.Assignment(SC.Member(SC.This(), "off"), SC.Member("str", "length")),
                    SC.If().addStatement(
                        SC.Assignment(SC.Member(SC.This(), "utf"), SC.Call(strCodePointAt, SC.Member(SC.This(), "off"))),
                        SC.Assignment(SC.Member(SC.This(), "ty"), SC.Call("getTypeAt", SC.Member(SC.This(), "utf")))
                    )
                ),
                SC.UnaryPre(SC.Return, SC.This())
            ),
            SC.Function(
                "END:bool"
            ).addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Member(SC.This(), "off"), ">=", SC.Member("str", "length")))
            ),
        )
    );
};