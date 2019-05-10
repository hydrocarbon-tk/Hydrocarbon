const env =  {
	table:{},
	ASI:true,
	functions:{
		for_stmt:function(set,bool,iter, body){this.set = set; this.bool = bool, this.iter=iter, this.body = body},
		if_stmt:function(sym){this.bool = sym[2]; this.body = sym[4]; this.else = sym[6]},
		while_stmt:function(sym){this.bool = sym[1]; this.body = sym[3]},
		return_stmt:function(sym){this.expr = sym[1]},
		class_stmt: function(sym){this.id = sym[1], this.tail= sym[2]},
		class_tail:function(sym){this.heritage = sym[0]; this.body = sym[2]},
		block_stmt:function(sym){this.stmts = sym[0]},
		debugger_stmt: function(sym){this.DEBUGGER = true},
		lex_stmt: function(sym){this.ty = sym[0]; this.declarations = sym[1]},
		var_stmt: function(sym){this.declarations = sym[1], console.log(sym)},
		call_expr:function(sym){this.id = sym[0]; this.args = sym[1]},
		member_expr: function(sym){this.id = sym[0]; this.expr = sym[2]},
		add_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "ADD"},
		or_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "OR"},
		and_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "AND"},
		sub_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "SUB"},
		mult_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "MUL"},
		div_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "DIV"},
		mod_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "MOD"},
		lt_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "LT"},
		gt_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "GT"},
		lte_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "LTE"},
		gte_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "GTE"},
		eq_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "EQ"},
		seq_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "STRICT_EQ"},
		neq_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "NEQ"},
		sneq_expr : function (sym){this.le = sym[0]; this.re=sym[2]; this.ty = "STRICT_NEQ"},
		unary_not_expr : function (sym){this.expr = sym[1]; this.ty = "NOT"},
		unary_plus : function (sym){this.expr = sym[1]; this.ty = "PRE INCR"},
		unary_minus : function (sym){this.expr = sym[1]; this.ty = "PRE INCR"},
		pre_inc_expr : function (sym){this.expr = sym[1]; this.ty = "PRE INCR"},
		pre_dec_expr : function (sym){this.expr = sym[1]; this.ty = "PRE DEC"},
		post_inc_expr : function (sym){this.expr = sym[0]; this.ty = "POST INCR"},
		post_dec_expr : function (sym){this.expr = sym[0]; this.ty = "POST DEC"},
		condition_expr : function (sym){this.condition = sym[0]; this.le = sym[2]; this.re = sym[4]},
		assignment_expr : function (sym){this.assignee = sym[0]; this.op = sym[1]; this.expr = sym[2]; },
		lex_declaration : function(v){this.id = v.id; this.expr = v.init},
		obj_literal : function (sym){this.props = sym[0];},
		null_literal : function (sym){this.ty = "null"},
		numeric_literal : function (sym){this.val = parseFloat(sym); this.ty = "num"},
		bool_literal : function(sym){this.val = sym[0].slice(1) == "true"},
		string_literal : function(sym){this.val = sym[0]},
		label_stmt : function(sym){this.label =sym[0]; this.stmt = sym[1]},
		identifier : function (sym){this.val = sym[0]; env.table[this.val] = null},
		funct_decl: function(id,args,body){this.id = id || "Anonymous"; this.args = args; this.body = body, this.scope = false},
		this_expr: function(){},
		defaultError: (tk, env, output, lex, prv_lex) => {
            /*USED for ASI*/
            if (env.ASI && lex.tx !== ")" && !lex.END) {
                let ENCOUNTERED_NL = (lex.tx == "}" || lex.END);

                while (!ENCOUNTERED_NL && !prv_lex.END && prv_lex.off < lex.off) {
                    prv_lex.next();
                    if (prv_lex.ty == prv_lex.types.nl)
                        ENCOUNTERED_NL = true;
                }

	            if (ENCOUNTERED_NL)
	                return ";";
            }

            if(lex.END)
            	return ";";

            return null;
        }

	},


	options : {
		integrate : false,
		onstart : ()=>{
			console.log("SDFS")
			env.table = {};
        	env.ASI = true;	
        }
	}
}

export default env;
