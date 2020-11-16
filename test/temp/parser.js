
import loader from "@assemblyscript/loader";

import { buildParserMemoryBuffer } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";

const
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(),
    fns = [(e, sym) => sym[sym.length - 1], (env, sym, pos) => (env.productions)
        , (env, sym, pos) => (env.productions.meta = { preambles: sym[0], pos })
        , (env, sym, pos) => (env.productions.meta = { pos })
        , (env, sym, pos) => ((!(sym[0].IMPORT_OVERRIDE || sym[0].IMPORT_APPEND)) ? env.productions.push(sym[0]) : 0)
        , (env, sym, pos) => (env.refs.set(sym[0].id, sym[0]), null)
        , (env, sym, pos) => (sym[1].id = env.productions.length, (!(sym[1].IMPORT_OVERRIDE || sym[1].IMPORT_APPEND)) ? env.productions.push(sym[1]) : 0, env.productions)
        , (env, sym, pos) => (env.refs.set(sym[1].id, sym[1]), sym[0])
        , (env, sym, pos) => (sym[0])
        , (env, sym) => new (class { constructor(env, sym, pos) { this.name = sym[1]; this.bodies = sym[3]; this.id = -1; this.recovery_handler = sym[4]; env.functions.compileProduction(this, env, pos); } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IMPORT_OVERRIDE = true; this.name = sym[1]; this.bodies = sym[3]; this.id = -1; env.functions.compileProduction(this, env, pos); } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IMPORT_APPEND = true; this.name = sym[1]; this.bodies = sym[3]; this.id = -1; env.functions.compileProduction(this, env, pos); } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.name = sym[1]; this.bodies = sym[3]; this.id = -1; env.functions.compileProduction(this, env, pos); } })(env, sym)
        , (env, sym, pos) => (env.body_count++, [sym[0]])
        , (env, sym, pos) => (env.body_count++, sym[0].push(sym[2]), sym[0])
        , (env, sym, pos) => (new env.fn.body([sym[1]], env, pos, undefined, !!sym[0]))
        , (env, sym, pos) => (new env.fn.body([sym[0]], env, pos, undefined, !!null))
        , (env, sym) => new (class { constructor(env, sym, pos) { this.body = sym[0]; this.reduce = sym[1]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.body = []; this.reduce = null; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.reduce = null; this.body = [sym[0]]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.body = sym[0]; } })(env, sym)
        , (env, sym, pos) => (env.body_offset = 0, [sym[0]])
        , (env, sym, pos) => (env.body_offset = sym[0].length, sym[0].push(sym[1]), sym[0])
        , (env, sym, pos) => (sym[1].map(e => (e.NO_BLANK = true, e)))
        , (env, sym, pos) => (true)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IS_CONDITION = true; this.type = "exc"; this.sym = sym[2]; this.offset = -1; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IS_CONDITION = true; this.type = "err"; this.sym = sym[2]; this.offset = -1; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IS_CONDITION = true; this.type = "ign"; this.sym = sym[2]; this.offset = -1; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IS_CONDITION = true; this.type = "rst"; this.sym = sym[2]; this.offset = -1; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.IS_CONDITION = true; this.type = "red"; this.sym = sym[2]; this.offset = -1; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.id = sym[1]; this.name = sym[3]; this.txt = ""; this.env = true; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.id = sym[1]; this.txt = sym[3]; this.env = false; this.name = ""; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "ERROR_RECOVERY"; this.lexer_text = sym[3]; this.body_text = sym[6]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED"; this.txt = sym[3]; this.name = ""; this.env = false; this.ref = ""; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED"; this.txt = ""; this.name = sym[3]; this.env = true; this.ref = ""; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED"; this.ref = sym[3]; this.txt = ""; this.name = ""; this.env = true; this.IS_CONDITION = true; const ref = env.refs.get(this.ref); if (ref) { if (Array.isArray(ref)) { ref.push(this); } else { let ref = env.refs.get(this.ref); this.env = ref.env; this.name = ref.name; this.txt = ref.txt; } } else { env.refs.set(this.ref, [this]); } } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "INLINE"; this.txt = sym[2]; this.name = ""; this.env = false; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "INLINE"; this.txt = ""; this.name = sym[2]; this.env = true; this.IS_CONDITION = true; } })(env, sym)
        , (env, sym, pos) => (sym[0] + sym[1])
        , (env, sym, pos) => ("<--" + sym[0].type + "^^" + sym[0].val + "-->")
        , (env, sym, pos) => (sym[0] + sym[1] + sym[2])
        , (env, sym, pos) => (([...sym[0], sym[1]]))
        , (env, sym, pos) => ([sym[0]])
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "symbols"; this.symbols = sym[2]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.grammar_stamp = env.stamp; this.type = "precedence"; this.terminal = sym[2]; this.val = parseInt(sym[3]); } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.grammar_stamp = env.stamp; this.type = "ignore"; this.symbols = sym[2]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.grammar_stamp = env.stamp; this.type = "error"; this.symbols = sym[2]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "name"; this.id = sym[2]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "ext"; this.id = sym[2]; } })(env, sym)
        , (env, sym, pos) => (sym[0] + "")
        , (env, sym) => new (class { constructor(env, sym, pos) { } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.val = sym[1]; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "symbol"; this.val = sym[0]; this.pos = pos; } })(env, sym)
        , (env, sym, pos) => (sym[0].IS_OPTIONAL = true, sym[0])
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "eof"; this.val = "$eof"; this.pos = pos; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "empty"; this.pos = pos; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "assert_token_function"; this.val = sym[2]; this.pos = pos; this.DOES_SHIFT = false; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "assert_token_function"; this.val = sym[2]; this.pos = pos; this.DOES_SHIFT = true; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "generated"; this.val = sym[1]; this.pos = pos; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "literal"; this.val = "" + sym[1]; this.pos = pos; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "symbol"; this.val = sym[1]; this.pos = pos; } })(env, sym)
        , (env, sym) => new (class { constructor(env, sym, pos) { this.type = "production"; this.name = sym[0]; this.val = -1; this.pos = pos; } })(env, sym)
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "hex", original_val: sym[0] })
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "bin", original_val: sym[0] })
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "oct", original_val: sym[0] })
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "sci", original_val: sym[0] })
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "flt", original_val: sym[0] })
        , (env, sym, pos) => ({ val: parseFloat(sym[0]), type: "int", original_val: sym[0] })
        , (env, sym, pos) => (sym[1])];

export default async function loadParser() {

    await URL.server();

    const wasmModule = await loader.instantiate(await URL.resolveRelative("./recognizer.wasm").fetchBuffer(), { env: { memory: shared_memory } }),

        { main, __newString, __release } = wasmModule.exports;

    return function (str, env = {}) {

        const
            str_ptr = __newString(str),
            FAILED = main(str_ptr), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];

        __release(str_ptr);

        let action_length = 0;

        if (FAILED) {

            let error_off = 0;


            const lexer = new Lexer(str);
            const probes = [];
            //Extract any probes
            for (let i = 0; i < er.length; i++) {
                if (((er[i] & 0xF000000F) >>> 0) == 0xF000000F) {
                    const num = er[i] & 0xFFFFFF0;
                    const sequence = (num >> 4) & 0xFFF;
                    const identifier = (num >> 16) & 0xFFF;
                    const token_type = [
                        "TokenEndOfLine",
                        "TokenSpace",
                        "TokenNumber",
                        "TokenIdentifier",
                        "TokenNewLine",
                        "TokenSymbol",
                        "TypeSymbol",
                        "TokenKeyword",
                    ][er[i + 1]];
                    const id = er[i + 2];
                    const token_length = er[i + 3];
                    const offset = er[i + 4];
                    const prod = er[i + 5] << 0;
                    const stack_ptr = er[i + 6];
                    const FAILED = !!er[i + 7];
                    i += 8;
                    const cp = lexer.copy();
                    cp.off = offset;
                    cp.tl = token_length;
                    probes.push({
                        identifier,
                        str: cp.tx,
                        token_type,
                        id,
                        token_length,
                        offset,
                        stack_ptr,
                        prod,
                        FAILED
                    });
                } else {
                    error_off = Math.max(error_off, er[i]);
                }
            }

            while (lexer.off < error_off && !lexer.END) lexer.next();
            console.table(probes);
            console.log(error_off, str.length);

            lexer.throw(`Unexpected token[${lexer.tx}]`);

        } else {

            let offset = 0;

            o: for (const action of aa) {
                action_length++;
                switch (action & 3) {
                    case 0: //ACCEPT
                        break o;
                    case 1: //REDUCE;
                        var
                            body = action >> 16,
                            len = ((action & 0xFFFF) >> 2);
                        stack[stack.length - len] = fns[body](env, stack.slice(-len), {});
                        stack.length = stack.length - len + 1;
                        break;
                    case 2: //SHIFT;
                        var len = action >> 2;
                        stack.push(str.slice(offset, offset + len));
                        offset += len;
                        break;
                    case 3: //SKIP;
                        var len = action >> 2;
                        offset += len;
                        break;
                }
            }
        }

        return { result: stack, FAILED: !!FAILED, action_length };
    };
}