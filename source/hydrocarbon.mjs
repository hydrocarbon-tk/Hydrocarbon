//LR
import { LALRTable } from "./lr/lalr.mjs";
import { SLRTable } from "./lr/slr.mjs";
import { LRParser } from "./lr/parser.mjs";
import { LRParserCompiler } from "./lr/compiler.mjs";
//LL

//GRAMMAR
import { grammarParser } from "./grammar_parser.mjs";

const exercise_a_grammer = `
   	e → E 		↦ cstr ^final	

   	E → E + T  	↦ cstr ^final
   	
   	  │ T 	

   	T → T * F 	↦ cstr ^final

   	  │ F 		

   	F → ( E ) 	↦ 0 console.log("open") 
   				↦ 2 console.log("close")

   	  │ θid 	↦ cstr ^final

`;

let env = {
	functions : {
		final : class {
			constructor(items, lex, env){
				this.items = items;

			}
		}
	}
};


const lalr = LALRTable(grammarParser(exercise_a_grammer), env);
const slr = SLRTable(grammarParser(exercise_a_grammer), env);

console.log(lalr, slr, LRParserCompiler(lalr, env));

export {
    LALRTable,
    SLRTable,
    LRParser,
    grammarParser
};