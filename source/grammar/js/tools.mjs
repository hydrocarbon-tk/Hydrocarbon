import identifier from "./identifier.mjs";
import types from "./types.mjs"
const env = {};
export default {

	processType(type, ast, fn){
		for(const a of ast.traverseDepthFirst()){
			if(a.type == type)
				fn(a);
		}
	},

	getFirst(ast, type){
		const tvrs = ast.traverseDepthFirst(); let node = null;

		while((node = tvrs.next().value)){
			if(node.type == type){
				return node;
			}
		}

		return null;
	},
	
	getClosureVariableNames(ast, ...global_objects){
		let
            tvrs = ast.traverseDepthFirst(),
            node = tvrs.next().value,
            non_global = new Set(),
            globals = new Set(),
            assignments = new Map();

        //Retrieve undeclared variables to inject as function arguments.
        while (node) {

            if (
                node.type == types.id ||
                node.type == types.member
            ) {
                if (node.root)
                    globals.add(node.name);
            }

            if (
                node.type == types.lex ||
                node.type == types.var
            ) {
                node.bindings.forEach(b => (non_global.add(b.id.name), globals.delete(b.id.name)));
            }

            node = tvrs.next().value;
        }

        return [...globals.values()].reduce((red, out) => {
            if (window[out] || out == "this") 
            	//Skip anything already defined on the global object. 
                return red;

            red.push(out)
            return red;
        }, [])
	},

	//Returns the argument names of the first function declaration defined in the ast
	getFunctionDeclarationArgumentNames(ast){
		const tvrs = ast.traverseDepthFirst(); let node = null;

		while((node = tvrs.next().value)){
			if(node.type == types.function_declaration){
				return node.args.map(e=>e.name);
			}
		}
		return [];
	},
	parse(lex){
		let l = lex.copy();

		return JSParser(lex, env);
	},

	validate(lex){
		let l = lex.copy();

		console.log(l.slice())
		try{
			let result = JSParser(lex, env);
			console.log(result)
			return true;
		}catch(e){
			console.error(e);
			return false;
		}
	},

	getRootVariables(lex){
		let l = lex.copy();
		
		let ids = new Set();
		let closure = new Set();

		try{
			let result = JSParser(lex, env);

			if(result instanceof identifier){
				ids.add(result.val);
			}else
				result.getRootIds(ids, closure);

			return {ids, ast:result, SUCCESS : true}
		}catch(e){
			return {ids, ast:null, SUCCESS : false};
		}
	},

	types : types
}
