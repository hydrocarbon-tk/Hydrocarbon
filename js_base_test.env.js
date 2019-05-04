const env =  {
	table:{},
	functions:{
		for_stmt:function(set,bool,iter, body){this.set = set; this.bool = bool, this.iter=iter, this.body = body},
		call_expr:function(sym){this.name = sym[0]; this.args = sym[1]},
		member_expr: function(sym){this.name = sym[0]; this.expr = sym[2]},
		class_stmt: function(sym){this.name = sym[1], this.tail= sym[2]},
		class_tail:function(sym){this.heritage = sym[0]; this.body = sym[2]},
		block_stmt:function(sym){this.stmts = sym[0]},
		debugger_stmt: function(sym){this.DEBUGGER = true},
		lex_stmt: function(sym){this.type = sym[0]; this.declarations = sym[1]},
		var_stmt: function(sym){this.declarations = sym[1]},
		lex_declaration : function(v){this.id = v.id; this.expr = v.init},
		var_declaration : function(v){this.id = v.id; this.expr = v.init},
		numeric_literal : function (sym){this.val = parseFloat(sym); this.type = "num"},
		bool_literal : function(sym){this.val = sym[0].slice(1) == "true"},
		string_literal : function(sym){this.val = sym[0]},
		identifier : function (sym){this.val = sym[0]; this.type = "id"; env.table[this.val] = undefined},
		add_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "ADD"},
		sub_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "SUB"},
		mult_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MUL"},
		div_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "DIV"},
		mod_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MOD"},
		pre_inc_expr : function (sym){this.expr = sym[1]; this.type = "PRE INCR"},
		pre_dec_expr : function (sym){this.expr = sym[1]; this.type = "PRE DEC"},
		post_inc_expr : function (sym){this.expr = sym[1]; this.type = "POST INCR"},
		post_dec_expr : function (sym){this.expr = sym[1]; this.type = "POST DEC"},
		condition_expr : function (sym){this.condition = sym[0]; this.left = sym[2]; this.right = sym[4]},
		assignment_expr : function (sym){this.assignee = sym[0]; this.op = sym[1]; this.expr = sym[2]; console.log(env.table)}
	},

	options : {
		integrate : false,
		defaultError : (l, )=>{

		}
	}
};

export default env;
