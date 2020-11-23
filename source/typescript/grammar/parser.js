


    import loader from "@assemblyscript/loader";
    import {buildParserMemoryBuffer} from "../hybrid/parser_memory.js";              
    import URL from "@candlefw/url";
    import Lexer from "@candlefw/wind";




const 
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(),
    fns = [(e,sym)=>sym[sym.length-1], 
(env, sym, pos)=>( env.productions)/*0*/
,(env, sym, pos)=>( env.productions.meta={preambles:sym[0],pos})/*1*/
,(env, sym, pos)=>( env.productions.meta={pos})/*2*/
,(env, sym, pos)=>( ([...sym[0],sym[1]]))/*3*/
,(env, sym, pos)=>( [sym[0]])/*4*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbols";this.symbols=sym[2];}})(env, sym)/*5*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="precedence";this.terminal=sym[2];this.val=parseInt(sym[3]);}})(env, sym)/*6*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="ignore";this.symbols=sym[2];}})(env, sym)/*7*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.grammar_stamp=env.stamp;this.type="error";this.symbols=sym[2];}})(env, sym)/*8*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="name";this.id=sym[2];}})(env, sym)/*9*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="ext";this.id=sym[2];}})(env, sym)/*10*/
,(env, sym, pos)=>( sym[0]+sym[1])/*11*/
,(env, sym, pos)=>( sym[0]+"")/*12*/
,(env, sym, pos)=>( env.functions.importData(sym, env, pos))/*13*/
,(env, sym, pos)=>( (!(sym[0].IMPORT_OVERRIDE||sym[0].IMPORT_APPEND))?env.productions.push(sym[0]):0)/*14*/
,(env, sym, pos)=>( env.refs.set(sym[0].id,sym[0]),null)/*15*/
,(env, sym, pos)=>( sym[1].id=env.productions.length,(!(sym[1].IMPORT_OVERRIDE||sym[1].IMPORT_APPEND))?env.productions.push(sym[1]):0,env.productions)/*16*/
,(env, sym, pos)=>( env.refs.set(sym[1].id,sym[1]),sym[0])/*17*/
,(env, sym, pos)=>( env.prod_name=sym[0],sym[0])/*18*/
,(env, sym, pos)=>( env.prod_name=sym[0].val,sym[0])/*19*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.name=sym[1];this.bodies=sym[3];this.id=-1;this.recovery_handler=sym[4];env.functions.compileProduction(this,env,pos);}})(env, sym)/*20*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IMPORT_OVERRIDE=true;this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*21*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IMPORT_APPEND=true;this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*22*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.name=sym[1];this.bodies=sym[3];this.id=-1;env.functions.compileProduction(this,env,pos);}})(env, sym)/*23*/
,(env, sym, pos)=>( env.body_count++,[sym[0]])/*24*/
,(env, sym, pos)=>( env.body_count++,sym[0].push(sym[2]),sym[0])/*25*/
,(env, sym, pos)=>( sym[0])/*26*/
,(env, sym, pos)=>( new env.fn.body([sym[1]],env,pos,undefined,!!sym[0]))/*27*/
,(env, sym, pos)=>( new env.fn.body([sym[0]],env,pos,undefined,!!null))/*28*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=sym[0];this.reduce=sym[1];}})(env, sym)/*29*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=[];this.reduce=null;}})(env, sym)/*30*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.reduce=null;this.body=[sym[0]];}})(env, sym)/*31*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.body=sym[0];}})(env, sym)/*32*/
,(env, sym, pos)=>( env.body_offset=0,[sym[0]])/*33*/
,(env, sym, pos)=>( env.body_offset=sym[0].length,sym[0].push(sym[1]),sym[0])/*34*/
,(env, sym, pos)=>( env.no_blank_index++,sym[1].map(e=>(e.NO_BLANK=env.no_blank_index,e)))/*35*/
,(env, sym, pos)=>( true)/*36*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="exc";this.sym=sym[2];this.offset=-1;}})(env, sym)/*37*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="err";this.sym=sym[2];this.offset=-1;}})(env, sym)/*38*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="ign";this.sym=sym[2];this.offset=-1;}})(env, sym)/*39*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="rst";this.sym=sym[2];this.offset=-1;}})(env, sym)/*40*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.IS_CONDITION=true;this.type="red";this.sym=sym[2];this.offset=-1;}})(env, sym)/*41*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.id=sym[1];this.name=sym[3];this.txt="";this.env=true;this.IS_CONDITION=true;}})(env, sym)/*42*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.id=sym[1];this.txt=sym[3];this.env=false;this.name="";this.IS_CONDITION=true;}})(env, sym)/*43*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="ERROR_RECOVERY";this.lexer_text=sym[3];this.body_text=sym[6];}})(env, sym)/*44*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.txt=sym[3];this.name="";this.env=false;this.ref="";this.IS_CONDITION=true;}})(env, sym)/*45*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.txt="";this.name=sym[3];this.env=true;this.ref="";this.IS_CONDITION=true;}})(env, sym)/*46*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type=(sym[1][0]=="c")?"CLASS":"RETURNED";this.ref=sym[3];this.txt="";this.name="";this.env=true;this.IS_CONDITION=true;const ref=env.refs.get(this.ref);if(ref){if(Array.isArray(ref)){ref.push(this);}else {let ref=env.refs.get(this.ref);this.env=ref.env;this.name=ref.name;this.txt=ref.txt;}}else {env.refs.set(this.ref,[this]);}}})(env, sym)/*47*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="INLINE";this.txt=sym[2];this.name="";this.env=false;this.IS_CONDITION=true;}})(env, sym)/*48*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="INLINE";this.txt="";this.name=sym[2];this.env=true;this.IS_CONDITION=true;}})(env, sym)/*49*/
,(env, sym, pos)=>( "<--"+sym[0].type+"^^"+sym[0].val+"-->")/*50*/
,(env, sym, pos)=>( sym[0]+sym[1]+sym[2])/*51*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.val=sym[1];}})(env, sym)/*52*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbol";this.val=sym[0];this.pos=pos;env.symbols.push(this);}})(env, sym)/*53*/
,(env, sym, pos)=>( new env.functions.groupProduction(sym, env, pos))/*54*/
,(env, sym, pos)=>( sym[0].IS_OPTIONAL=true,sym[0])/*55*/
,(env, sym, pos)=>( new env.functions.listProduction(sym, env, pos))/*56*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="eof";this.val="<--eof^^<--eof^^<--eof^^<--eof^^<--eof^^<--eof^^<--eof^^<--eof^^<--eof^^$eof-->-->-->-->-->-->-->-->-->";this.pos=pos;env.symbols.push(this);}})(env, sym)/*57*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="empty";this.pos=pos;env.symbols.push(this);}})(env, sym)/*58*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="assert_token_function";this.val=sym[2];this.pos=pos;this.DOES_SHIFT=false;}})(env, sym)/*59*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="assert_token_function";this.val=sym[2];this.pos=pos;this.DOES_SHIFT=true;}})(env, sym)/*60*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="generated";this.val=sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*61*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="literal";this.val=""+sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*62*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="symbol";this.val=sym[1];this.pos=pos;env.symbols.push(this);}})(env, sym)/*63*/
,(env, sym)=>new (class{constructor(env, sym, pos){this.type="production";this.name=sym[0];this.val=-1;this.pos=pos;}})(env, sym)/*64*/
,(env, sym, pos)=>( new env.functions.importProduction(sym, env, pos))/*65*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"hex",original_val:sym[0]})/*66*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"bin",original_val:sym[0]})/*67*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"oct",original_val:sym[0]})/*68*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"sci",original_val:sym[0]})/*69*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"flt",original_val:sym[0]})/*70*/
,(env, sym, pos)=>( {val:parseFloat(sym[0]),type:"int",original_val:sym[0]})/*71*/
,(env, sym, pos)=>( sym[1])/*72*/];

export default async function loadParser(){ 

    await URL.server();

    const wasmModule = await loader.instantiate(await URL.resolveRelative("@candlefw/hydrocarbon/build/wasm/recognizer.wasm").fetchBuffer(), { env: { memory: shared_memory } }),
    
    { main, __newString } = wasmModule.exports;

    return function (str, env = {}) {

        const 
            str_ptr = __newString(str),
            FAILED = main(str_ptr), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];
        
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

            lexer.throw(`Unexpected token[${ lexer.tx }]`);
    
        } else {

            let offset = 0, pos = [{ off: 0, tl: 0 }];

            for (const action of aa) {

                action_length++;
                let prev_off = 0;

                if (action == 0) break;

                switch (action & 1) {
                    case 0: //REDUCE;
                        {
                            const
                                DO_NOT_PUSH_TO_STACK = (action >> 1) & 1,
                                body = action >> 16,
                                len = ((action >> 2) & 0x3FFF);

                            const pos_a = pos[pos.length - len - 1];
                            const pos_b = pos[pos.length - 1];
                            pos[stack.length - len] = { off: pos_a.off, tl: 0 };

                            stack[stack.length - len] = fns[body](env, stack.slice(-len), { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl });

                            //  console.log(stack[stack.length - len], pos);

                            if (!DO_NOT_PUSH_TO_STACK) {
                                stack.length = stack.length - len + 1;
                                pos.length = pos.length - len + 1;
                            } else {
                                stack.length = stack.length - len;
                                pos.length = pos.length - len;
                            }
                            // console.log(pos);

                        } break;

                    case 1: { //SHIFT;
                        const
                            has_len = (action >>> 1) & 1,
                            has_skip = (action >>> 2) & 1,
                            len = action >>> (3 + (has_skip * 15)),
                            skip = has_skip * ((action >>> 3) & (~(has_len * 0xFFFF8000)));
                        offset += skip;
                        if (has_len) {
                            stack.push(str.slice(offset, offset + len));
                            pos.push({ off: offset, tl: len });
                            offset += len;
                        }
                    } break;
                }
            }
        }
    
        return { result: stack, FAILED: !!FAILED, action_length };
    }
    } 