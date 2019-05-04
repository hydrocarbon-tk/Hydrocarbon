const env =  {
	table:{},
	ASI:true,
	functions:{

		for_stmt:function(set,bool,iter, body){this.set = set; this.bool = bool, this.iter=iter, this.body = body},
		class_stmt: function(sym){this.identifier = sym[1], this.tail= sym[2]},
		class_tail:function(sym){this.heritage = sym[0]; this.body = sym[2]},
		block_stmt:function(sym){this.stmts = sym[0]},
		debugger_stmt: function(sym){this.DEBUGGER = true},
		lex_stmt: function(sym){this.type = sym[0]; this.declarations = sym[1]},
		var_stmt: function(sym){this.declarations = sym[1], console.log(sym)},
		
		call_expr:function(sym){this.identifier = sym[0]; this.args = sym[1]},
		member_expr: function(sym){this.identifier = sym[0]; this.expr = sym[2]},
		add_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "ADD"},
		sub_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "SUB"},
		mult_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MUL"},
		div_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "DIV"},
		mod_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MOD"},
		lt_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "LT"},
		gt_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "GT"},
		lte_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "LTE"},
		gte_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "GTE"},
		eq_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "EQ"},
		seq_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "STRICT_EQ"},
		neq_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "ENQ"},
		sneq_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "STRICT_NEQ"},
		pre_inc_expr : function (sym){this.expr = sym[1]; this.type = "PRE INCR"},
		pre_dec_expr : function (sym){this.expr = sym[1]; this.type = "PRE DEC"},
		post_inc_expr : function (sym){this.expr = sym[1]; this.type = "POST INCR"},
		post_dec_expr : function (sym){this.expr = sym[1]; this.type = "POST DEC"},
		condition_expr : function (sym){this.condition = sym[0]; this.left = sym[2]; this.right = sym[4]},
		assignment_expr : function (sym){this.assignee = sym[0]; this.op = sym[1]; this.expr = sym[2]; console.log(env.table)},
		
		lex_declaration : function(v){this.id = v.id; this.expr = v.init},
		obj_literal : function (sym){this.props = sym[0];},
		numeric_literal : function (sym){this.val = parseFloat(sym); this.type = "num"},
		bool_literal : function(sym){this.val = sym[0].slice(1) == "true"},
		string_literal : function(sym){this.val = sym[0]},
		identifier : function (sym){this.val = sym[0]; this.type = "id"; env.table[this.val] = undefined},
		
		defaultError: (tk, env, output, lex, prv_lex) => {
            /*USED for ASI*/
            if (env.ASI) {
                let ENCOUNTERED_NL = (lex.tx == "}" || lex.END);

                while (!ENCOUNTERED_NL && !prv_lex.END && prv_lex.off < lex.off) {
                    prv_lex.next();
                    if (prv_lex.ty == prv_lex.types.nl)
                        ENCOUNTERED_NL = true;
                }

	            if (ENCOUNTERED_NL)
	                return ";";
            }

            return null;
        }

	},


	options : {
		integrate : false,
		onstart : ()=>{
        	env.ASI = true;	
        }
	}
}

export default env;
