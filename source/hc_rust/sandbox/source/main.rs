use std::time;

use candlelib_hydrocarbon::completer::completer::complete;
use candlelib_hydrocarbon::kernel::state_machine::run;

static instructions: [u32; 323] = [
    0, 4026531840, 2164260864, 4026531841, 67108864, 1, 2835349528, 0, 65539, 2155872296,
    2147502191, 2147494004, 268435456, 1476395009, 13, 805306387, 0, 268435456, 637534286,
    603979822, 0, 268435456, 2566914158, 0, 65537, 4026531840, 268435456, 2566914149, 0, 65537,
    4026531840, 268435456, 1476395009, 17, 805306387, 0, 2826960901, 0, 1, 2147483655, 268435456,
    1476395009, 9999, 805306387, 0, 4026531840, 2835349530, 0, 65538, 2147483752, 2147520631,
    268435456, 2566914162, 0, 65537, 4026531840, 268435456, 2566914149, 0, 65537, 4026531840,
    268435456, 2566914149, 0, 65537, 4026531840, 268435456, 805306383, 0, 268435456, 2566914159, 0,
    65537, 4026531840, 268435456, 805306386, 0, 4026531840, 2818572309, 0, 131078, 2168471567,
    2160091149, 2147483666, 2134933507, 2147491857, 2147524627, 1476395009, 18, 805306387, 0,
    1476395009, 17, 805306387, 0, 1476395009, 15, 805306387, 0, 1476395009, 13, 805306387, 0,
    1476395009, 9999, 805306387, 0, 0, 4026531840, 0, 2835349529, 0, 131077, 2147483693,
    2143309865, 2147524650, 2151688235, 2147514415, 268435456, 1476395009, 10, 805306387, 0,
    268435456, 1476395009, 11, 805306387, 0, 268435456, 1476395009, 14, 805306387, 0, 268435456,
    1476395009, 12, 805306387, 0, 268435456, 1476395009, 16, 805306387, 0, 2826960901, 0, 1,
    2147483655, 268435456, 1476395009, 9999, 805306387, 0, 4026531840, 0, 2835349514, 0, 65538,
    2147483693, 2143299627, 268435456, 1476395009, 10, 805306387, 0, 268435456, 1476395009, 11,
    805306387, 0, 2826960901, 0, 1, 2147483655, 268435456, 1476395009, 9999, 805306387, 0,
    4026531840, 0, 2835349509, 0, 1, 2147483689, 268435456, 1476395009, 14, 805306387, 0,
    2826960901, 0, 1, 2147483655, 268435456, 1476395009, 9999, 805306387, 0, 4026531840, 0,
    637534441, 603980048, 0, 2822766596, 67108974, 65538, 2151677964, 2147483664, 268435456,
    603979991, 603980048, 0, 805306369, 0, 0, 1073742104, 805306370, 0, 2822766596, 67109018,
    65538, 2147483658, 2147483659, 268435456, 603980006, 603980048, 0, 805306368, 0, 0, 1073742104,
    805306369, 0, 2818572295, 0, 65539, 2155884544, 2147489793, 2147483650, 637534441, 603979979,
    0, 637534441, 603979994, 0, 0, 4026531840, 3120562442, 2818572300, 0, 65538, 2147483650,
    2147489793, 637534455, 603979979, 0, 2554331146, 0, 65537, 4026531840, 268435456, 637534455,
    603980006, 603980048, 0, 4026531840, 2550136833, 0, 65537, 4026531840, 0, 0, 2822766603,
    67108870, 131076, 2147495953, 2143289357, 2147495954, 2147495951, 268435456, 637534510,
    603980068, 637534455, 603980048, 0, 268435456, 1073742600, 805306370, 637534510, 0, 4026531840,
    0, 2822766596, 67109044, 1, 2147483662, 268435456, 1073742360, 805306370, 0, 4026531840, 0,
    3120562493, 2818572297, 0, 1, 2147483650, 2554331148, 67108974, 65537, 4026531840, 268435456,
    637534510, 603979991, 603980048, 0, 4026531840, 2550136834, 0, 65537, 4026531840, 0, 0,
];

fn main() {
    coz::thread_init();
    let input = "two + three";

    let scan_input = "scan_input := []uint8(`export function createCompilableCode(grammar: GrammarObject): void {
		// Reset the reduce_functions lookup to prepare the grammar for output
		// to Struct / Class formats. 
	
	
		grammar.reduce_functions = <Map<string, { id: number, data: any; }>>new Map();
		grammar.compiled = {
			structs: null,
			primary_enum: null
		};
	
		const class_types = [];
	
		//Create classes based on return values
		for (const production of grammar.productions) {
	
			// Store type information per production
			// this will be used later to assign types to
			// class members. 
			for (const body of production.bodies) {
	
				if (body.reduce_function) {
	
					const fn = body.reduce_function;
	
					if (fn.type == \"env-function-reference\") {
						// TODO - Reference reduce function in CPP output
						continue;
					} else if (!fn.txt) {
						body.reduce_function = null;
						continue;
					}
	
					const expression = exp(`(${fn.txt.replace(/(\\${1,2}\\d+)/g, \"$1_\")})`).nodes[0];
	
					const receiver = { ast: null };
	
					for (const { node, meta: { mutate } } of traverse(expression, \"nodes\").makeMutable().extract(receiver)) {
						//Object literals serve as the main AST node definition type. 
						if (node.type == JSNodeType.ObjectLiteral) {
							// CPP only accepts basic member types:
							// PropertyBinding with identifiers keys
	
							const cpp_type = <any>convertObjectLiteralNodeToCPPClassNode(node, body);
							mutate(cpp_type);
							class_types.push(cpp_type);
						} else {
							if (node.type == JSNodeType.ArrayLiteral) {
	
								//@ts-ignore
								node.type = \"cpp_ast_ref_vector\";
	
							} else if (node.type == JSNodeType.IdentifierReference) {
								const val = JSIdentifierRefToCompilableVal(node, \"\", body);
								if (val)
									mutate(<any>val);
							}
						}
					}
	
					body.reduce_function.compilable_ast = receiver.ast;
				}
			}
		}
	
		//Merge class types that have the same enum
		grammar.compiled.structs = processStructs(class_types, grammar);
	
		convertBodyFunctionsToLambdas(grammar);
	}}".as_bytes();

    let start_laz = time::Instant::now();

    let mut i = 0;
    let mut scope = 1;

    while scope > 0 {
        let v = scan_input[i];
        if v == 123 {
            scope += 1;
        } else if v == 125 {
            scope -= 1;
        }
        i += 1;
    }

    let elapsed = start_laz.elapsed();
    println!("Elapsed lazy: {:.2?}", elapsed);
    let start = time::Instant::now();
    coz::begin!("recog");
    let (mut valid, mut invalid) = run(
        instructions.as_ptr(),
        instructions.len(),
        input.as_ptr(),
        input.len(),
        67109064,
    );
    let elapsed = start.elapsed();
    coz::progress!("apple");
    coz::end!("recog");
    complete(input.as_ptr(), input.len(), &mut valid);

    println!("Elapsed: {:.2?}", elapsed);
}
