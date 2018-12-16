//LR
import { LALRTable } from "./lr/lalr.mjs";
import { SLRTable } from "./lr/slr.mjs";
import { LRParser } from "./lr/parser.mjs";
import { LRParserCompiler } from "./lr/compiler.mjs";
//LL

//GRAMMAR
import { grammarParser } from "./grammar_parser.mjs";

import whind  from "/node_modules/@candlefw/whind/source/whind.mjs";

const exercise_b_grammer = `
   	e → E 		↦ cstr ^final	
              ↦ err console.log("e error occured at", start)

   	E → E + T  	↦ cstr ^final
                ↦ err console.log("E=> E + T error occured at", start)
   	
   	  │ T 	↦ err console.log("E=>T error occured at", start)

   	T → T * F 	↦ cstr ^final
                ↦ err console.log("T => T * F error occured at", start)

   	  │ F 		↦ err console.log("Unexpected error occured at", lex.slice(start))

   	F → ( E ) 	↦ 0 console.log("open") 
   				      ↦ 2 console.log("close")
                ↦ err console.log("F => ( E ) error occured at", start)

   	  │ θid 	↦ cstr ^final
              ↦ err console.log("F=>id error occured at", start)
`;

const exercise_a_grammer = `
    #prec - 4
    #assc - left

    e → E    

    E → E + E   ↦ cstr ^final 
      │ E - E   ↦ cstr ^final
      │ E * E   ↦ cstr ^final 
      │ E / E   ↦ cstr ^final
      │ - E  %0 ↦ cstr ^final
      │ F 
    
    F → ( E )   ↦ cstr ^final
      │ θnum    ↦ cstr ^final
`;

let env = {
	functions : {
		final : class {
			constructor(items){
				this.items = items;
			}
      build(){
        if(this.items.length > 2){
          if(this.items[0] == "(")
            return this.items[1].build();
          return `${this.items[0].build()} ${this.items[2].build()} ${this.items[1]}`;
        }
        if(this.items.length == 2)
          return `${this.items[1].build()} ~`;
        else return this.items[0];
      }
		}
	}
};
const lalr = LALRTable(grammarParser(exercise_a_grammer), env);
//const slr = SLRTable(grammarParser(exercise_a_grammer), env);

let parser = (Function(LRParserCompiler(lalr, env) + "return parser;"))();

console.log( parser(whind("-1 * (((2)) + 50 * -5) / 3+-4"),{}).build());

export {
    LALRTable,
    SLRTable,
    LRParser,
    grammarParser
};