import jsmain from './parser.js';
import { performance } from 'perf_hooks';

import { constructCompilerEnvironment } from '@candlefw/hydrocarbon/build/library/grammar/grammar_parser.js';

async function start() {
  const parser = await jsmain();

  {
    const env = constructCompilerEnvironment('', { count: 0 }, { count: 0 }, 112, new Map);
    try {

      env.fn = env.functions;
      const ts = performance.now();
      const result = parser(str, env);
      const te = performance.now();
      console.dir(result, { depth: null });
      console.log(te - ts);
    } catch (e) {
      console.log(e);
      //   console.dir(env, { depth: null });
    }
  }
}
var str = `
@IGNORE θws θnl

<>start → defaultproductions

<> defaultproductions → defaultproduction(+)

<> defaultproduction → id
    │ hex
    │ binary
    │ octal
    │ scientific
    | js_identifier
    | identifier

<> hex_digit →  θint │ τa │ τb │ τc │ τd │ τe │ τf │ τA │ τB │ τC │ τD │ τE │ τF

<> hex →  θhex                                  ↦r { {val:parseFloat($sym1), type: "hex", original_val:$sym1} }
 
<> binary →  θbin                               ↦r { {val:parseFloat($sym1), type: "bin", original_val:$sym1} }

<> octal →  θoct                                ↦r { {val:parseFloat($sym1), type: "oct", original_val:$sym1} }

<> scientific → θsci                            ↦r { {val:parseFloat($sym1), type: "sci", original_val:$sym1} }
    │ float 

<> float → θflt                                 ↦r { {val:parseFloat($sym1), type: "flt", original_val:$sym1} }
    │ integer                                   

<> integer → natural                            ↦r { {val:parseFloat($sym1), type: "int", original_val:$sym1} }

<> natural →  θnum                              

<> id → θid

<> string > \\" ( string_value | θws )(+\\')  \\"         ↦r { $sym2 }
    | \\' ( string_value | θws )(+\\")  \\'               ↦r { $sym2 }

<> string_value > (RED θws)  ( \\/ | \\\\ | \\- | \\_ | θany | θob | θcb | θnum | θid | θsym | \\\\ θany  )(+\\")

<> js_identifier → (RED θws) js_id_symbols 

<> js_id_symbols →  js_id_symbols θid           ↦r { $sym1 + $sym2 }
    │ js_id_symbols θkey                        ↦r { $sym1 + $sym2 }
    │ js_id_symbols \\_                          ↦r { $sym1 + $sym2 }
    │ js_id_symbols \\$                          ↦r { $sym1 + $sym2 }
    │ js_id_symbols θnum                        ↦r { $sym1 + $sym2 }
    │ js_id_symbols θhex                        ↦r { $sym1 + $sym2 }
    │ js_id_symbols θbin                        ↦r { $sym1 + $sym2 }
    │ js_id_symbols θoct                        ↦r { $sym1 + $sym2 }
    │ \\_ 
    │ \\$ 
    │ θid
    │ θkey

<> identifier → (RED θws) identifier_symbols 

<> identifier_symbols →  identifier_symbols θid      ↦r { $sym1 + $sym2 }
    │ identifier_symbols \\_                          ↦r { $sym1 + $sym2 }
    │ identifier_symbols \\-                          ↦r { $sym1 + $sym2 }
    │ identifier_symbols \\$                          ↦r { $sym1 + $sym2 }
    │ identifier_symbols θnum                        ↦r { $sym1 + $sym2 }
    │ identifier_symbols θhex                        ↦r { $sym1 + $sym2 }
    │ identifier_symbols θbin                        ↦r { $sym1 + $sym2 }
    │ identifier_symbols θoct                        ↦r { $sym1 + $sym2 }
    │ \\_ 
    │ \\$ 
    │ θid

`;
//str = `<> S > E ↦r { { o:('parenth'), d:$sym1} }`;
//str = `( (test);(test);, mango ) => { trucks }`;
start();