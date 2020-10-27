
import { jump_table } from "./jump_table.js";

import fs from "fs";

import loader from "@assemblyscript/loader";

import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";

await URL.server();

const wasmModule = loader.instantiateSync(fs.readFileSync(URL.resolveRelative("./build/untouched.wasm") + "")),
    { main, __allocString, __getUint32ArrayView, __getUint16ArrayView, __retain, __release, Export } = wasmModule.exports,
    wasm_jump_table = __getUint16ArrayView(wasmModule.exports.jump_table.value);

for (let i = 0; i < jump_table.length; i++)
    wasm_jump_table[i] = jump_table[i];



const fns = [
    ,
    //1 :: STYLE_SHEET_HC_listbody1_100=>• STYLE_SHEET_HC_listbody1_100 import
    sym => (([...sym[0], sym[1]]))
    ,
    //2 :: STYLE_SHEET_HC_listbody1_100=>• import
    sym => ([sym[0]])
    ,
    ,
    ,
    //5 :: STYLE_SHEET_HC_listbody1_102=>• STYLE_SHEET_HC_listbody1_102 STYLE_SHEET_group_03_101
    sym => (([...sym[0], sym[1]]))
    ,
    //6 :: STYLE_SHEET_HC_listbody1_102=>• STYLE_SHEET_group_03_101
    sym => ([sym[0]])
    ,
    //7 :: STYLE_SHEET=>• STYLE_SHEET_HC_listbody1_100 STYLE_SHEET_HC_listbody1_102
    sym => ({ type: "Stylesheet", imports: sym[0], nodes: sym[1] })
    ,
    //8 :: STYLE_SHEET=>• STYLE_SHEET_HC_listbody1_102
    sym => ({ type: "Stylesheet", imports: null, nodes: sym[0] })
    ,
    //9 :: STYLE_SHEET=>• STYLE_SHEET_HC_listbody1_100
    sym => ({ type: "Stylesheet", imports: sym[0], nodes: null })
    ,
    //10 :: STYLE_SHEET=>•
    sym => ({ type: "Stylesheet", imports: null, nodes: null })
    ,
    //11 :: STYLE_RULE_HC_listbody2_103=>• STYLE_RULE_HC_listbody2_103 , COMPLEX_SELECTOR
    sym => (([...sym[0], sym[2]]))
    ,
    //12 :: STYLE_RULE_HC_listbody2_103=>• COMPLEX_SELECTOR
    sym => ([sym[0]])
    ,
    //13 :: STYLE_RULE=>• STYLE_RULE_HC_listbody2_103 { declaration_list ; }
    sym => ({ type: "Rule", selectors: sym[0], precedence: 0 })
    ,
    //14 :: STYLE_RULE=>• STYLE_RULE_HC_listbody2_103 { ; }
    sym => ({ type: "Rule", selectors: sym[0], precedence: 0 })
    ,
    //15 :: STYLE_RULE=>• STYLE_RULE_HC_listbody2_103 { declaration_list }
    sym => ({ type: "Rule", selectors: sym[0], precedence: 0 })
    ,
    //16 :: STYLE_RULE=>• STYLE_RULE_HC_listbody2_103 { }
    sym => ({ type: "Rule", selectors: sym[0], precedence: 0 })
    ,
    //17 :: GROUP_RULE_BODY_HC_listbody5_104=>• GROUP_RULE_BODY_HC_listbody5_104 STYLE_RULE
    sym => (([...sym[0], sym[1]]))
    ,
    //18 :: GROUP_RULE_BODY_HC_listbody5_104=>• STYLE_RULE
    sym => ([sym[0]])
    ,
    //19 :: GROUP_RULE_BODY=>• GROUP_RULE_BODY STYLE_RULE
    sym => (([...sym[0], sym[1]]))
    ,
    //20 :: GROUP_RULE_BODY=>• STYLE_RULE
    sym => ([sym[0]])
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //34 :: import_HC_listbody5_108=>• import_HC_listbody5_108 , media_query
    sym => (([...sym[0], sym[2]]))
    ,
    //35 :: import_HC_listbody5_108=>• media_query
    sym => ([sym[0]])
    ,
    //36 :: import=>• @ import import_group_012_105 import_group_315_107 import_HC_listbody5_108
    sym => ({ import: "@import", type: "Import", nodes: [sym[2], sym[3], ...sym[4]] })
    ,
    //37 :: import=>• @ import import_group_012_105 import_HC_listbody5_108
    sym => ({ import: "@import", type: "Import", nodes: [sym[2], null, ...sym[3]] })
    ,
    //38 :: import=>• @ import import_group_012_105 import_group_315_107
    sym => ({ import: "@import", type: "Import", nodes: [sym[2], sym[3], ...null] })
    ,
    //39 :: import=>• @ import import_group_012_105
    sym => ({ import: "@import", type: "Import", nodes: [sym[2], null, ...null] })
    ,
    ,
    //41 :: keyframes_HC_listbody5_109=>• keyframes_HC_listbody5_109 keyframes_blocks
    sym => (([...sym[0], sym[1]]))
    ,
    //42 :: keyframes_HC_listbody5_109=>• keyframes_blocks
    sym => ([sym[0]])
    ,
    //43 :: keyframes=>• @ keyframes keyframes_name { keyframes_HC_listbody5_109 }
    sym => ({ keyframes: "@keyframes", type: "Keyframes", name: sym[2], nodes: [sym[4]] })
    ,
    ,
    ,
    //46 :: keyframes_blocks_HC_listbody1_110=>• keyframes_blocks_HC_listbody1_110 , keyframe_selector
    sym => (([...sym[0], sym[2]]))
    ,
    //47 :: keyframes_blocks_HC_listbody1_110=>• keyframe_selector
    sym => ([sym[0]])
    ,
    //48 :: keyframes_blocks=>• keyframes_blocks_HC_listbody1_110 { declaration_list ; }
    sym => ({ type: "KeyframeBlock", nodes: [{ type: "KeyframeSelectors", nodes: sym[0] }, sym[2]] })
    ,
    //49 :: keyframes_blocks=>• keyframes_blocks_HC_listbody1_110 { declaration_list }
    sym => ({ type: "KeyframeBlock", nodes: [{ type: "KeyframeSelectors", nodes: sym[0] }, sym[2]] })
    ,
    //50 :: keyframe_selector=>• from
    sym => ({ type: "KeyframeSelector", val: sym[0] })
    ,
    //51 :: keyframe_selector=>• to
    sym => ({ type: "KeyframeSelector", val: sym[0] })
    ,
    //52 :: keyframe_selector=>• percentage
    sym => ({ type: "KeyframeSelector", val: sym[0] })
    ,
    //53 :: supports_group_025_111=>• supports_condition
    sym => ({ type: "SupportConditions", nodes: sym[0] })
    ,
    //54 :: supports=>• @ supports supports_group_025_111 { GROUP_RULE_BODY }
    sym => ({ type: "Supports", nodes: [sym[0], sym[2]] })
    ,
    //55 :: supports=>• @ supports supports_group_025_111 { }
    sym => ({ type: "Supports", nodes: [sym[0], sym[2]] })
    ,
    //56 :: supports_condition_group_129_112=>• and supports_in_parens
    sym => ({ type: "And", nodes: [sym[1]] })
    ,
    //57 :: supports_condition_group_129_112=>• or supports_in_parens
    sym => ({ type: "Or", nodes: [sym[1]] })
    ,
    //58 :: supports_condition_HC_listbody2_113=>• supports_condition_HC_listbody2_113 supports_condition_group_129_112
    sym => (([...sym[0], sym[1]]))
    ,
    //59 :: supports_condition_HC_listbody2_113=>• supports_condition_group_129_112
    sym => ([sym[0]])
    ,
    //60 :: supports_condition=>• not supports_in_parens
    sym => ([{ type: "Not", nodes: [sym[1]] }])
    ,
    //61 :: supports_condition=>• supports_in_parens supports_condition_HC_listbody2_113
    sym => ([sym[0], ...sym[1]])
    ,
    //62 :: supports_condition=>• supports_in_parens
    sym => ([sym[0]])
    ,
    //63 :: supports_in_parens=>• ( supports_condition )
    sym => ({ type: "Parenthesis", nodes: [sym[1]] })
    ,
    ,
    ,
    ,
    ,
    ,
    //69 :: supports_feature_fn=>• selector ( COMPLEX_SELECTOR )
    sym => ({ type: "Function", nodes: [sym[0]] })
    ,
    //70 :: media=>• @ media media_queries { GROUP_RULE_BODY }
    sym => ({ media: "@media", type: "Media", nodes: [sym[2], ...sym[4]] })
    ,
    //71 :: media=>• @ media media_queries { }
    sym => ({ media: "@media", type: "Media", nodes: [sym[2]] })
    ,
    //72 :: media_queries_HC_listbody7_114=>• media_queries_HC_listbody7_114 , media_query
    sym => (([...sym[0], sym[2]]))
    ,
    //73 :: media_queries_HC_listbody7_114=>• media_query
    sym => ([sym[0]])
    ,
    //74 :: media_queries_group_039_115=>• media_queries_group_039_115 , media_query
    sym => (([...sym[0], sym[2]]))
    ,
    //75 :: media_queries_group_039_115=>• media_query
    sym => ([sym[0]])
    ,
    //76 :: media_queries=>• media_queries_group_039_115
    sym => ({ queries: true, type: "MediaQueries", nodes: sym[0] })
    ,
    ,
    ,
    //79 :: media_query_group_144_117=>• and media_condition_without_or
    sym => ({ type: "And", nodes: [sym[1]] })
    ,
    //80 :: media_query=>• media_condition
    sym => ({ type: "Query", nodes: [sym[0]] })
    ,
    //81 :: media_query=>• media_query_group_043_116 media_type media_query_group_144_117
    sym => ({ type: "Query", condition: sym[0], nodes: [sym[1], sym[2]] })
    ,
    //82 :: media_query=>• media_type media_query_group_144_117
    sym => ({ type: "Query", nodes: [sym[0], sym[1]] })
    ,
    //83 :: media_query=>• media_query_group_043_116 media_type
    sym => ({ type: "Query", condition: sym[0], nodes: [sym[1]] })
    ,
    //84 :: media_query=>• media_type
    sym => ({ type: "Query", nodes: [sym[0]] })
    ,
    ,
    ,
    ,
    ,
    ,
    //90 :: media_not=>• not media_in_parenths
    sym => ({ type: "Not", nodes: [sym[1]] })
    ,
    //91 :: media_and_group_152_118=>• and media_in_parenths
    sym => ({ type: "And", nodes: [sym[1]] })
    ,
    //92 :: media_and_HC_listbody2_119=>• media_and_HC_listbody2_119 media_and_group_152_118
    sym => (([...sym[0], sym[1]]))
    ,
    //93 :: media_and_HC_listbody2_119=>• media_and_group_152_118
    sym => ([sym[0]])
    ,
    //94 :: media_and=>• media_in_parenths media_and_HC_listbody2_119
    sym => ([sym[0], ...sym[1]])
    ,
    //95 :: media_or_group_154_120=>• or media_in_parenths
    sym => ({ type: "And", nodes: [sym[1]] })
    ,
    //96 :: media_or_HC_listbody2_121=>• media_or_HC_listbody2_121 media_or_group_154_120
    sym => (([...sym[0], sym[1]]))
    ,
    //97 :: media_or_HC_listbody2_121=>• media_or_group_154_120
    sym => ([sym[0]])
    ,
    //98 :: media_or=>• media_in_parenths media_or_HC_listbody2_121
    sym => ([sym[0], ...sym[1]])
    ,
    //99 :: media_in_parenths=>• ( media_condition )
    sym => ({ type: "Parenthesis", nodes: [sym[1]] })
    ,
    ,
    ,
    ,
    ,
    ,
    //105 :: media_feature=>• ( media_feature_group_061_122 )
    sym => ({ type: "MediaFeature", nodes: [sym[1]] })
    ,
    ,
    ,
    //108 :: general_enclosed_HC_listbody1_124=>• general_enclosed_HC_listbody1_124 general_enclosed_group_064_123
    sym => (sym[0] + sym[1])
    ,
    //109 :: general_enclosed_HC_listbody1_124=>• general_enclosed_group_064_123
    sym => (sym[0] + "")
    ,
    //110 :: general_enclosed=>• identifier ( general_enclosed_HC_listbody1_124 )
    sym => ({ type: "MediaFunction", nodes: [sym[2]] })
    ,
    //111 :: general_enclosed=>• identifier ( )
    sym => ({ type: "MediaFunction", nodes: [] })
    ,
    //112 :: mf_plain=>• mf_name : mf_value
    sym => ({ type: "MediaValue", key: sym[0], val: sym[2] })
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //122 :: mf_range=>• mf_name mf_range_group_071_125 mf_value
    sym => ({ type: "MediaEquality", sym: sym[1], left: sym[0], right: sym[2] })
    ,
    //123 :: mf_range=>• mf_value mf_range_group_071_125 mf_name
    sym => ({ type: "MediaEquality", sym: sym[1], left: sym[0], right: sym[2] })
    ,
    //124 :: mf_range=>• mf_value mf_range_group_080_126 identifier mf_range_group_080_126 mf_value
    sym => ({ type: "MediaRangeDescending", sym: sym[1], max: sym[0], id: sym[2], min: sym[4] })
    ,
    //125 :: mf_range=>• mf_value mf_range_group_085_127 identifier mf_range_group_085_127 mf_value
    sym => ({ type: "MediaRangeAscending", sym: sym[1], min: sym[0], id: sym[2], max: sym[4] })
    ,
    ,
    ,
    ,
    ,
    //130 :: mf_boolean=>• true
    sym => ({ type: "Boolean", val: true })
    ,
    //131 :: mf_boolean=>• false
    sym => ({ type: "Boolean", val: false })
    ,
    ,
    //133 :: media_type=>• identifier
    sym => ({ type: "MediaType", val: sym[0] })
    ,
    //134 :: ratio=>• θnum / θnum
    sym => ({ type: "ratio", num: sym[0], den: sym[2] })
    ,
    //135 :: percentage=>• θnum %
    sym => (new parseFloat(sym[0]))
    ,
    //136 :: dimension=>• θnum θid
    sym => (new parseFloat(sym[0]))
    ,
    //137 :: url=>• url ( )
    sym => (new String(sym[2]))
    ,
    ,
    //139 :: COMPLEX_SELECTOR_group_0102_128=>• COMBINATOR
    sym => ({ type: "Combinator", val: sym[0] })
    ,
    //140 :: COMPLEX_SELECTOR_group_1103_129=>• COMPLEX_SELECTOR_group_0102_128 COMPOUND_SELECTOR
    sym => ([sym[0], sym[1]])
    ,
    //141 :: COMPLEX_SELECTOR_group_1103_129=>• COMPOUND_SELECTOR
    sym => ([sym[0]])
    ,
    //142 :: COMPLEX_SELECTOR_HC_listbody2_130=>• COMPLEX_SELECTOR_HC_listbody2_130 COMPLEX_SELECTOR_group_1103_129
    sym => (([...sym[0], sym[1]]))
    ,
    //143 :: COMPLEX_SELECTOR_HC_listbody2_130=>• COMPLEX_SELECTOR_group_1103_129
    sym => ([sym[0]])
    ,
    //144 :: COMPLEX_SELECTOR=>• COMPOUND_SELECTOR COMPLEX_SELECTOR_HC_listbody2_130
    sym => ((sym[0] && sym[1]) ? { type: "ComplexSelector", nodes: [sym[0], ...((sym[1]).flat(2))] } : sym[0])
    ,
    //145 :: COMPLEX_SELECTOR=>• COMPOUND_SELECTOR
    sym => ((sym[0] && null) ? { type: "ComplexSelector", nodes: [sym[0]] } : sym[0])
    ,
    //146 :: COMPOUND_SELECTOR_HC_listbody1_131=>• COMPOUND_SELECTOR_HC_listbody1_131 SUBCLASS_SELECTOR
    sym => (([...sym[0], sym[1]]))
    ,
    //147 :: COMPOUND_SELECTOR_HC_listbody1_131=>• SUBCLASS_SELECTOR
    sym => ([sym[0]])
    ,
    //148 :: COMPOUND_SELECTOR_HC_listbody1_132=>• COMPOUND_SELECTOR_HC_listbody1_132 PSEUDO_CLASS_SELECTOR
    sym => (([...sym[0], sym[1]]))
    ,
    //149 :: COMPOUND_SELECTOR_HC_listbody1_132=>• PSEUDO_CLASS_SELECTOR
    sym => ([sym[0]])
    ,
    //150 :: COMPOUND_SELECTOR_group_1105_133=>• PSEUDO_ELEMENT_SELECTOR COMPOUND_SELECTOR_HC_listbody1_132
    sym => ({ type: "PseudoSelector", nodes: [sym[0], ...sym[1]] })
    ,
    //151 :: COMPOUND_SELECTOR_group_1105_133=>• PSEUDO_ELEMENT_SELECTOR
    sym => ({ type: "PseudoSelector", nodes: [sym[0]] })
    ,
    //152 :: COMPOUND_SELECTOR_HC_listbody2_134=>• COMPOUND_SELECTOR_HC_listbody2_134 COMPOUND_SELECTOR_group_1105_133
    sym => (([...sym[0], sym[1]]))
    ,
    //153 :: COMPOUND_SELECTOR_HC_listbody2_134=>• COMPOUND_SELECTOR_group_1105_133
    sym => ([sym[0]])
    ,
    //154 :: COMPOUND_SELECTOR=>• TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134
    sym => ((sym[0] && !(sym[1] || sym[2])) ? sym[0] : (sym[1] && sym[1].length == 1 && !(sym[0] || sym[2])) ? sym[1][0] : { type: "CompoundSelector", nodes: [sym[0], ...sym[1], ...sym[2]] })
    ,
    //155 :: COMPOUND_SELECTOR=>• COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134
    sym => ((null && !(sym[0] || sym[1])) ? null : (sym[0] && sym[0].length == 1 && !(null || sym[1])) ? sym[0][0] : { type: "CompoundSelector", nodes: [...sym[0], ...sym[1]] })
    ,
    //156 :: COMPOUND_SELECTOR=>• TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody2_134
    sym => ((sym[0] && !(null || sym[1])) ? sym[0] : (null && null.length == 1 && !(sym[0] || sym[1])) ? null[0] : { type: "CompoundSelector", nodes: [sym[0], ...sym[1]] })
    ,
    //157 :: COMPOUND_SELECTOR=>• TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131
    sym => ((sym[0] && !(sym[1] || null)) ? sym[0] : (sym[1] && sym[1].length == 1 && !(sym[0] || null)) ? sym[1][0] : { type: "CompoundSelector", nodes: [sym[0], ...sym[1]] })
    ,
    //158 :: COMPOUND_SELECTOR=>• COMPOUND_SELECTOR_HC_listbody2_134
    sym => ((null && !(null || sym[0])) ? null : (null && null.length == 1 && !(null || sym[0])) ? null[0] : { type: "CompoundSelector", nodes: [...sym[0]] })
    ,
    //159 :: COMPOUND_SELECTOR=>• COMPOUND_SELECTOR_HC_listbody1_131
    sym => ((null && !(sym[0] || null)) ? null : (sym[0] && sym[0].length == 1 && !(null || null)) ? sym[0][0] : { type: "CompoundSelector", nodes: [...sym[0]] })
    ,
    //160 :: COMPOUND_SELECTOR=>• TYPE_SELECTOR
    sym => ((sym[0] && !(null || null)) ? sym[0] : (null && null.length == 1 && !(sym[0] || null)) ? null[0] : { type: "CompoundSelector", nodes: [sym[0]] })
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //167 :: NS_PREFIX=>• NS_PREFIX_group_0112_135 |
    sym => (sym[0])
    ,
    //168 :: NS_PREFIX=>• |
    sym => (null)
    ,
    //169 :: WQ_NAME=>• NS_PREFIX identifier
    sym => ({ type: "QualifiedName", ns: sym[0] || "", val: sym[1] })
    ,
    //170 :: WQ_NAME=>• identifier
    sym => ({ type: "QualifiedName", ns: "", val: sym[0] })
    ,
    ,
    ,
    ,
    ,
    //175 :: ID_SELECTOR=>• # identifier
    sym => ({ type: "IdSelector", val: sym[1], precedence: "B_SPECIFIER" })
    ,
    //176 :: CLASS_SELECTOR=>• . identifier
    sym => ({ type: "ClassSelector", val: sym[1], precedence: "C_SPECIFIER" })
    ,
    //177 :: PSEUDO_CLASS_SELECTOR_group_2121_136=>• ( string )
    sym => (sym[1])
    ,
    //178 :: PSEUDO_CLASS_SELECTOR=>• : identifier PSEUDO_CLASS_SELECTOR_group_2121_136
    sym => ({ type: "PseudoClassSelector", id: sym[1], val: sym[2], precedence: "C_SPECIFIER" })
    ,
    //179 :: PSEUDO_CLASS_SELECTOR=>• : identifier
    sym => ({ type: "PseudoClassSelector", id: sym[1], precedence: "C_SPECIFIER" })
    ,
    ,
    //181 :: ATTRIBUTE_SELECTOR_group_2125_137=>• " string "
    sym => ("\"" + sym[1] + "\"")
    ,
    //182 :: ATTRIBUTE_SELECTOR=>• [ WQ_NAME ]
    sym => ({ type: "AttributeSelector", nodes: [sym[1]], precedence: "C_SPECIFIER" })
    ,
    //183 :: ATTRIBUTE_SELECTOR=>• [ WQ_NAME ATTR_MATCHER ATTRIBUTE_SELECTOR_group_2125_137 ATTR_MODIFIER ]
    sym => ({ type: "AttributeSelector", nodes: [sym[1]], match_type: sym[2], match_val: sym[3], mod: sym[4], precedence: "C_SPECIFIER" })
    ,
    //184 :: ATTRIBUTE_SELECTOR=>• [ WQ_NAME ATTR_MATCHER ATTRIBUTE_SELECTOR_group_2125_137 ]
    sym => ({ type: "AttributeSelector", nodes: [sym[1]], match_type: sym[2], match_val: sym[3], precedence: "C_SPECIFIER" })
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //192 :: TYPE_SELECTOR=>• WQ_NAME
    sym => ({ type: "TypeSelector", nodes: [sym[0]], precedence: "D_SPECIFIER" })
    ,
    //193 :: TYPE_SELECTOR=>• NS_PREFIX *
    sym => ({ type: "TypeSelector", nodes: [{ type: "QualifiedName", ns: sym[0] || "", val: "*", precedence: 0 }] })
    ,
    //194 :: TYPE_SELECTOR=>• *
    sym => ({ type: "TypeSelector", nodes: [{ type: "QualifiedName", ns: "", val: "*", precedence: 0 }] })
    ,
    //195 :: PSEUDO_ELEMENT_SELECTOR=>• : PSEUDO_CLASS_SELECTOR
    sym => (sym[1].type = "PseudoElementSelector", sym[1].precedence = "D_SPECIFIER", sym[1])
    ,
    //196 :: declaration_list_HC_listbody3_138=>• declaration_list_HC_listbody3_138 ;
    sym => (([...sym[0], sym[1]]))
    ,
    //197 :: declaration_list_HC_listbody3_138=>• ;
    sym => ([sym[0]])
    ,
    ,
    ,
    //200 :: declaration_list_HC_listbody2_140=>• declaration_list_HC_listbody2_140 ; declaration_list_group_1137_139
    sym => (([...sym[0], sym[2]]))
    ,
    //201 :: declaration_list_HC_listbody2_140=>• declaration_list_group_1137_139
    sym => ([sym[0]])
    ,
    //202 :: declaration_list_HC_listbody1_141=>• declaration_list_HC_listbody1_141 ;
    sym => (([...sym[0], sym[1]]))
    ,
    //203 :: declaration_list_HC_listbody1_141=>• ;
    sym => ([sym[0]])
    ,
    //204 :: declaration_list=>• declaration_list_HC_listbody2_140 declaration_list_HC_listbody1_141
    sym => (sym[0])
    ,
    //205 :: declaration_list=>• declaration_list_HC_listbody2_140
    sym => (sym[0])
    ,
    ,
    ,
    //208 :: declaration=>• declaration_id : declaration_values declaration_group_1140_142
    sym => ({ type: "Declaration", name: sym[0], val: sym[2], IMPORTANT: !!sym[3] })
    ,
    //209 :: declaration=>• declaration_id : declaration_values
    sym => ({ type: "Declaration", name: sym[0], val: sym[2] })
    ,
    ,
    ,
    ,
    //213 :: declaration_values_HC_listbody1_144=>• declaration_values_HC_listbody1_144 declaration_values_group_0144_143
    sym => (sym[0] + sym[1])
    ,
    //214 :: declaration_values_HC_listbody1_144=>• declaration_values_group_0144_143
    sym => (sym[0] + "")
    ,
    ,
    //216 :: declaration_values=>• declaration_values ( declaration_values_HC_listbody1_144 )
    sym => (sym[0] + sym[1] + sym[2] + sym[3])
    ,
    //217 :: declaration_values=>• declaration_values string_value
    sym => (sym[0] + sym[1])
    ,
    //218 :: declaration_values=>• declaration_values θws
    sym => (sym[0] + sym[1])
    ,
    ,
    //220 :: css_id_symbols=>• css_id_symbols θid
    sym => (sym[0] + sym[1])
    ,
    //221 :: css_id_symbols=>• css_id_symbols _
    sym => (sym[0] + sym[1])
    ,
    //222 :: css_id_symbols=>• css_id_symbols -
    sym => (sym[0] + sym[1])
    ,
    //223 :: css_id_symbols=>• css_id_symbols $
    sym => (sym[0] + sym[1])
    ,
    //224 :: css_id_symbols=>• css_id_symbols θnum
    sym => (sym[0] + sym[1])
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //234 :: string_value_HC_listbody1_146=>• string_value_HC_listbody1_146 string_value_group_0162_145
    sym => (sym[0] + sym[1])
    ,
    //235 :: string_value_HC_listbody1_146=>• string_value_group_0162_145
    sym => (sym[0] + "")
    ,
    //236 :: string_value=>• string_value string_value_group_0162_145
    sym => (sym[0] + sym[1])
    ,
    //237 :: string_value=>• string_value_group_0162_145
    sym => (sym[0] + "")
    ,
    ,
    //239 :: def$defaultproductions_HC_listbody1_100=>• def$defaultproductions_HC_listbody1_100 def$defaultproduction
    sym => (([...sym[0], sym[1]]))
    ,
    //240 :: def$defaultproductions_HC_listbody1_100=>• def$defaultproduction
    sym => ([sym[0]])
    ,
    //241 :: def$defaultproductions=>• def$defaultproductions def$defaultproduction
    sym => (([...sym[0], sym[1]]))
    ,
    //242 :: def$defaultproductions=>• def$defaultproduction
    sym => ([sym[0]])
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //263 :: def$hex=>• θhex
    sym => ({ val: parseFloat(sym[0]), type: "hex", original_val: sym[0] })
    ,
    //264 :: def$binary=>• θbin
    sym => ({ val: parseFloat(sym[0]), type: "bin", original_val: sym[0] })
    ,
    //265 :: def$octal=>• θoct
    sym => ({ val: parseFloat(sym[0]), type: "oct", original_val: sym[0] })
    ,
    //266 :: def$scientific=>• θsci
    sym => ({ val: parseFloat(sym[0]), type: "sci", original_val: sym[0] })
    ,
    ,
    //268 :: def$float=>• θflt
    sym => ({ val: parseFloat(sym[0]), type: "flt", original_val: sym[0] })
    ,
    ,
    //270 :: def$integer=>• def$natural
    sym => ({ val: parseFloat(sym[0]), type: "int", original_val: sym[0] })
    ,
    ,
    ,
    ,
    ,
    //275 :: def$string_HC_listbody1_102=>• def$string_HC_listbody1_102 def$string_group_034_101
    sym => (sym[0] + sym[1])
    ,
    //276 :: def$string_HC_listbody1_102=>• def$string_group_034_101
    sym => (sym[0] + "")
    ,
    //277 :: def$string_HC_listbody1_103=>• def$string_HC_listbody1_103 def$string_group_034_101
    sym => (sym[0] + sym[1])
    ,
    //278 :: def$string_HC_listbody1_103=>• def$string_group_034_101
    sym => (sym[0] + "")
    ,
    //279 :: def$string=>• " def$string_HC_listbody1_102 "
    sym => (sym[1])
    ,
    //280 :: def$string=>• ' def$string_HC_listbody1_103 '
    sym => (sym[1])
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    //292 :: def$string_value_HC_listbody2_105=>• def$string_value_HC_listbody2_105 def$string_value_group_149_104
    sym => (sym[0] + sym[1])
    ,
    //293 :: def$string_value_HC_listbody2_105=>• def$string_value_group_149_104
    sym => (sym[0] + "")
    ,
    ,
    ,
    //296 :: def$js_id_symbols=>• def$js_id_symbols θid
    sym => (sym[0] + sym[1])
    ,
    //297 :: def$js_id_symbols=>• def$js_id_symbols θkeyword
    sym => (sym[0] + sym[1])
    ,
    //298 :: def$js_id_symbols=>• def$js_id_symbols _
    sym => (sym[0] + sym[1])
    ,
    //299 :: def$js_id_symbols=>• def$js_id_symbols $
    sym => (sym[0] + sym[1])
    ,
    //300 :: def$js_id_symbols=>• def$js_id_symbols θnum
    sym => (sym[0] + sym[1])
    ,
    //301 :: def$js_id_symbols=>• def$js_id_symbols θhex
    sym => (sym[0] + sym[1])
    ,
    //302 :: def$js_id_symbols=>• def$js_id_symbols θbin
    sym => (sym[0] + sym[1])
    ,
    //303 :: def$js_id_symbols=>• def$js_id_symbols θoct
    sym => (sym[0] + sym[1])
    ,
    ,
    ,
    ,
    ,
    //308 :: def$identifier_symbols=>• def$identifier_symbols θid
    sym => (sym[0] + sym[1])
    ,
    //309 :: def$identifier_symbols=>• def$identifier_symbols θkeyword
    sym => (sym[0] + sym[1])
    ,
    //310 :: def$identifier_symbols=>• def$identifier_symbols _
    sym => (sym[0] + sym[1])
    ,
    //311 :: def$identifier_symbols=>• def$identifier_symbols -
    sym => (sym[0] + sym[1])
    ,
    //312 :: def$identifier_symbols=>• def$identifier_symbols $
    sym => (sym[0] + sym[1])
    ,
    //313 :: def$identifier_symbols=>• def$identifier_symbols θnum
    sym => (sym[0] + sym[1])
    ,
    //314 :: def$identifier_symbols=>• def$identifier_symbols θhex
    sym => (sym[0] + sym[1])
    ,
    //315 :: def$identifier_symbols=>• def$identifier_symbols θbin
    sym => (sym[0] + sym[1])
    ,
    //316 :: def$identifier_symbols=>• def$identifier_symbols θoct
    sym => (sym[0] + sym[1])
    ,
    ,
    ,];

export default function jsmain(str) {

    let strPtr = __retain(__allocString(str));
    let exportPtr = main(strPtr); // call with pointers

    const exports = Export.wrap(exportPtr);

    const FAILED = exports.getFailed();
    const aaPtr = exports.getActionList();
    const erPtr = exports.getErrorOffsets();

    const aa = __getUint32ArrayView(aaPtr);
    const er = __getUint32ArrayView(erPtr);

    const stack = [];
    let action_length = 0;

    if (FAILED) {

        const error_off = er.sort((a, b) => a - b)[er.length - 1];

        const lexer = new Lexer(str);

        console.log(lexer, error_off, str.length, er);

        while (lexer.off < error_off) lexer.next();

        console.log(lexer.throw(`Unexpected token[${lexer.tx}]`));

    } else if (true) {
        //Build out the productions

        let offset = 0;

        o: for (const action of aa) {

            if (action == 0) break;

            switch (action & 3) {
                case 0: //ACCEPT
                    return stack[0];

                case 1: //REDUCE;
                    var body = action >> 16;

                    action_length++;
                    var len = ((action & 0xFFFF) >> 2);

                    const fn = fns[body];


                    if (fn) {
                        stack[stack.length - len] = fn(stack.slice(-len));
                    }
                    else if (len > 1)
                        stack[stack.length - len] = stack[stack.length - 1];

                    stack.length = stack.length - len + 1;

                    break;
                case 2: //SHIFT;
                    var len = action >> 2;
                    stack.push(str.slice(offset, offset + len));
                    offset += len;
                    action_length++;
                    break;
                case 3: //SKIP;
                    var len = action >> 2;
                    offset += len;
                    break;
            }
        }
    }

    __release(erPtr);
    __release(aaPtr);
    __release(exportPtr);
    __release(strPtr);

    return { result: stack, FAILED: !!FAILED, action_length };
}  