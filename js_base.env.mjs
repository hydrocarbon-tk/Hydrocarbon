export default {
	functions:{
		numeric_literal : function (sym){this.val = parseFloat(sym); this.type = "num"},
		identifier : function (sym){this.val = sym[0]; this.type = "id"},
		add_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "ADD"},
		sub_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "SUB"},
		mult_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MUL"},
		div_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "DIV"},
		mod_expr : function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MOD"},
		pre_inc_expr : function (sym){this.expr = sym[1]; this.type = "PRE INCR"},
		pre_dec_expr : function (sym){this.expr = sym[1]; this.type = "PRE DEC"},
		post_inc_expr : function (sym){this.expr = sym[1]; this.type = "POST INCR"},
		post_dec_expr : function (sym){this.expr = sym[1]; this.type = "POST DEC"}
	},
	
	options : {
		integrate : false
	}
}