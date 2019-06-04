import for_stmt from "./for.mjs";
import call_expr from "./call.mjs";
import identifier from "./identifier.mjs";
import catch_stmt from "./catch.mjs";
import try_stmt from "./try.mjs";
import stmts from "./stmts.mjs";
import block from "./block.mjs";
import lexical from "./lexical.mjs";
import binding from "./binding.mjs";
import member from "./member.mjs";
import assign from "./assign.mjs";
import add from "./add.mjs";
import exp from "./exp.mjs";
import sub from "./sub.mjs";
import div from "./div.mjs";
import mult from "./mult.mjs";
import object from "./object.mjs";
import debugger_stmt from "./debugger.mjs";
import string from "./string.mjs";
import null_ from "./null.mjs";
import number from "./number.mjs";
import bool from "./bool.mjs";
import negate from "./negate.mjs";
import rtrn from "./return.mjs";
import condition from "./condition.mjs";
import array_literal from "./array_literal.mjs";
import this_expr from "./this.mjs";
import property_binding from "./property_binding.mjs";
import arrow from "./arrow_declaration.mjs";
import funct_decl from "./function_declaration.mjs";
import expression_list from "./expression_list.mjs";
import if_stmt from "./if.mjs";
import post_inc from "./post_inc.mjs";
import post_dec from "./post_dec.mjs";
import expr_stmt from "./expression_statement.mjs";
import _or from "./or.mjs";
import _and from "./and.mjs";
import not from "./not.mjs";
import new_member_stmt from "./new_member_expression.mjs";
import spread from "./spread.mjs";
import equal from "./equal.mjs";
import greater from "./greater.mjs";
import greater_eq from "./greater_eq.mjs";
import less from "./less.mjs";
import less_eq from "./less_eq.mjs";

const env = {
    table: {},
    ASI: true,
    functions: {

        //JS
        add,
        and: _and,
        array_literal,
        arrow,
        assign,
        binding,
        block,
        bool_literal: bool,
        call_expr,
        catch_stmt,
        condition_expr: condition,
        debugger_stmt,  
        div,
        eq: equal,
        exp,
        expr_stmt,
        expression_list,
        for_stmt,
        funct_decl,
        gt: greater,
        gteq: greater_eq,
        identifier,
        if_stmt,
        lexical,
        lt: less,
        lteq: less_eq,
        member,
        mult,
        negate_expr: negate,
        null_literal: null_,
        numeric_literal: number,
        object,
        or: _or,
        post_dec_expr: post_dec,
        post_inc_expr: post_inc,
        property_binding,
        unary_not_expr:not,
        new_member_stmt,
        spread_expr:spread,
        return_stmt: rtrn,
        stmts,
        string_literal: string,
        sub,
        this_expr,
        try_stmt,
        while_stmt: function(sym) {
            this.bool = sym[1];
            this.body = sym[3];
        },
        var_stmt: function(sym) { this.declarations = sym[1] },
        mod_expr: function(sym) {
            this.le = sym[0];
            this.re = sym[2];
            this.ty = "MOD";
        },
        seq_expr: function(sym) {
            this.le = sym[0];
            this.re = sym[2];
            this.ty = "STRICT_EQ";
        },
        neq_expr: function(sym) {
            this.le = sym[0];
            this.re = sym[2];
            this.ty = "NEQ";
        },
        sneq_expr: function(sym) {
            this.le = sym[0];
            this.re = sym[2];
            this.ty = "STRICT_NEQ";
        },
        unary_plus: function(sym) {
            this.expr = sym[1];
            this.ty = "PRE INCR";
        },
        unary_minus: function(sym) {
            this.expr = sym[1];
            this.ty = "PRE INCR";
        },
        pre_inc_expr: function(sym) {
            this.expr = sym[1];
            this.ty = "PRE INCR";
        },
        pre_dec_expr: function(sym) {
            this.expr = sym[1];
            this.ty = "PRE DEC";
        },

        label_stmt: function(sym) {
            this.label = sym[0];
            this.stmt = sym[1];
        },

        defaultError: (tk, env, output, lex, prv_lex, ss, lu) => {
            /*USED for ASI*/

            if (env.ASI && lex.tx !== ")" && !lex.END) {

                if (lex.tx == "</") // As in "<script> script body => (</)script>"
                    return lu.get(";");

                let ENCOUNTERED_END_CHAR = (lex.tx == "}" || lex.END || lex.tx == "</");

                while (!ENCOUNTERED_END_CHAR && !prv_lex.END && prv_lex.off < lex.off) {
                    prv_lex.next();
                    if (prv_lex.ty == prv_lex.types.nl)
                        ENCOUNTERED_END_CHAR = true;
                }

                if (ENCOUNTERED_END_CHAR)
                    return lu.get(";");
            }

            if (lex.END)
                return lu.get(";");
        }
    },

    options: {
        integrate: false,
        onstart: () => {
            env.table = {};
            env.ASI = true;
        }
    }
};

export default env;
