import { Lexer } from "@candlefw/wind";
import crypto from "crypto";
import { Node, Block, Expression, Expressions, UnaryPre, UnaryPost, Value, Switch, Function, Class, Call, If, Statement, ScriptNode, While, Constant, Variable, Assignment, Member, Declare, Binary, Group, Comment, This } from "../types/skribble";

function isBlockStatement(n: Node): n is Block {
    return n.isBLOCK;
}

function isStatement(n: Node): n is Block {
    return n.isSTATEMENT || n.type == "comment";
}

function isExpression(n: Node): n is Expression {
    return n.isEXPRESSION;
}

function isExpressions(n: Node): n is Expressions {
    return n.type == "expressions";
}

function isUnaryPrefix(n: Node): n is UnaryPre {
    return n.type == "unary-prefix";
}

function isUnaryPostfix(n: Node): n is UnaryPost {
    return n.type == "unary-postfix";
}

function isValue(n: Node): n is Value {
    return n.type == "value";
}
function isSwitch(n: Node): n is Switch {
    return n.type == "switch";
}

function isFunction(n: Node): n is Function {
    return n.type == "function";
}

function isClass(n: Node): n is Class {
    return n.type == "class";
}

function isCall(n: Node): n is Call {
    return n.type == "call";
}

function isIf(n: Node): n is If {
    return n.type == "if";
}

function isExpressionsAReturn(n: SC<Node>): boolean {
    return (
        isExpressions(n.type)
        && n.expressions.length == 1
        && isUnaryPrefix(n.expressions[0].type)
        && isValue(n.expressions[0].expressions[0].type)
        && n.expressions[0].expressions[0].type.value == "return"
    );
}

function acceptsStatements(n: Node): n is Block {
    return isBlockStatement(n);
}

function TAB(count: number) {
    return "    ".repeat(Math.max(0, count));
}
/**
 * ScriptBuilder
 * 
 * Used to construct basic ASTs for compiling compiler scripts to 
 * different languages;
 */
export class SC<T = Node> {
    type: T;
    expressions: SC<Expression>[];
    statements: SC<Statement>[];
    type_data: string;

    static Bind<T>(data: SC<T>): SC<T> {

        if (data instanceof SC) return data;

        const new_obj: SC<T> = Object.assign(Object.create(new SC), data);

        if (new_obj.expressions)
            new_obj.expressions = new_obj.expressions.map(s => SC.Bind(s));

        if (new_obj.statements)
            new_obj.statements = new_obj.statements.map(s => SC.Bind(s));

        return new_obj;
    }

    constructor(d?: T) {

        //@ts-ignore
        this.type = d ?? <ScriptNode>{
            type: "script",
            isBLOCK: true,
            isSTATEMENT: true,
            statements: true

        };
        const u: Node = <any>this.type;
        if (u.statements)
            this.statements = [];
        if (u.expressions)
            this.expressions = [];
    }


    static While(boolean_expression?: SC<Expression>): SC<While> {
        const node = new SC<While>({
            type: "while",
            isBLOCK: true,
            isSTATEMENT: true,
            expressions: true,
            statements: true
        });
        if (boolean_expression) node.expressions.push(boolean_expression);
        return node;
    }
    static Expressions(...expressions: SC<Expression>[]): SC<Expressions> {
        const node = new SC<Expressions>({
            type: "expressions",
            isSTATEMENT: true,
            expressions: true
        });
        node.expressions.push(...expressions.filter(_ => !!_));
        return node;
    }
    static Function(name: SC<Constant | Variable> | string, ...args: (SC<Assignment | Constant | Variable> | string)[]): SC<Function> {
        const node = new SC<Function>({
            type: "function",
            isBLOCK: true,
            isSTATEMENT: true,
            expressions: true,
            statements: true,
        });
        node.expressions.push(name instanceof SC ? name : SC.Constant(name), ...args.map(s => s instanceof SC ? s : SC.Variable(s)));
        return node;
    }
    static Call(object: SC<Constant | Value | Variable | Member> | string, ...args: (SC<Expression> | string | number)[]): SC<Call> {
        const node = new SC<Call>({
            type: "call",
            expressions: true,
            isEXPRESSION: true
        });
        node.expressions.push(object instanceof SC ? object : SC.Constant(object), ...args.map(s => s instanceof SC ? s : typeof s == "string" ? SC.Constant(s) : SC.Value(s)));
        return node;
    };
    static Empty(): SC<Variable> {
        const node = new SC<Variable>({
            type: "variable",
            isEXPRESSION: true,
            value: "",
            val_type: ""
        });
        return node;
    }
    static Variable(name: string, ...template_specializations: (SC<Constant | Variable> | string)[]): SC<Variable> {
        const name_part = name.split(":")[0];
        const val_part = name.split(":")[1] ?? "";
        const node = new SC<Variable>({
            type: "variable",
            isEXPRESSION: true,
            value: name_part,
            val_type: val_part,
            expressions: true
        });

        node.expressions.push(...template_specializations.map(s => s instanceof SC ? s : SC.Constant(s)));

        return node;
    }
    static Constant(name: string, ...template_specializations: (SC<Constant | Variable> | string)[]): SC<Constant> {
        const name_part = name.split(":")[0];
        const val_part = name.split(":")[1] ?? "";

        const node = new SC<Constant>({
            type: "constant",
            isEXPRESSION: true,
            value: name_part,
            val_type: val_part,
            expressions: true
        });

        node.expressions.push(...template_specializations.map(s => s instanceof SC ? s : SC.Constant(s)));

        return node;
    }

    static Declare(...declarations: SC<Assignment | Constant | Variable>[]): SC<Declare> {
        const node = new SC<Declare>({
            type: "declare",
            isSTATEMENT: true,
            expressions: true
        });
        node.expressions.push(...declarations);
        return node;
    };

    static Assignment(assignee: SC<Constant | Variable | Member> | string, value: SC<Expression> | string | number): SC<Assignment> {
        const node = new SC<Assignment>({
            type: "assign",
            isEXPRESSION: true,
            expressions: true
        });
        node.expressions.push(assignee instanceof SC ? assignee : SC.Variable(assignee), value instanceof SC ? value : typeof (value) == "string" ? SC.Variable(value) : SC.Value(value));
        return node;
    };
    static Class(name: SC<Constant | Variable> | string, ...inheritance: SC<Constant | Variable | Value>[]): SC<Class> {
        const node = new SC<Class>({
            type: "class",
            isBLOCK: true,
            isSTATEMENT: true,
            expressions: true,
            statements: true
        });
        node.expressions.push(name instanceof SC ? name : SC.Constant(name));
        return node;
    };
    static Value(value: string | number | SC<Value>): SC<Value> {
        if (value instanceof SC) return value;

        const node = new SC<Value>({
            isEXPRESSION: true,
            type: "value",
            value: value + "",
            value_type: ""
        });
        return node;
    };

    static Comment(value: any): SC<Value> {
        const node = new SC<Value>({
            isEXPRESSION: true,
            //@ts-ignore
            type: "comment",
            value,
        });
        return node;
    };

    static Member(obj: SC<Constant | Variable | Member> | string, mem: SC<Constant | Variable | Member> | string): SC<Member> {
        const node = new SC<Member>({
            type: "member",
            isEXPRESSION: true,
            expressions: true
        });
        node.expressions.push(obj instanceof SC ? obj : SC.Constant(obj), mem instanceof SC ? mem : SC.Constant(mem));
        return node;
    };
    static Binary(left: SC<Expression> | string | number, operator: SC<Value> | number | string, right: SC<Expression> | string | number): SC<Binary> {
        const node = new SC<Binary>({
            type: "binary",
            isEXPRESSION: true,
            expressions: true
        });
        node.expressions.push(left instanceof SC ? left : SC.Value(left), SC.Value(operator), right instanceof SC ? right : SC.Value(right));
        return node;
    };
    static Group(sentinel: string, ...expressions: SC<Expression>[]): SC<Group> {
        const node = new SC<Group>({
            type: "group",
            isEXPRESSION: true,
            value: sentinel,
            expressions: true
        });
        node.expressions.push(...expressions.filter(_ => !!_));
        return node;
    };
    static UnaryPre(operator: SC<Value> | number | string, expression: SC<Expression>): SC<UnaryPre> {
        const node = new SC<UnaryPre>({
            type: "unary-prefix",
            isEXPRESSION: true,
            expressions: true
        });
        node.expressions.push(SC.Value(operator), expression);
        return node;
    };
    static UnaryPost(expression: SC<Expression>, operator: SC<Value> | number | string): SC<UnaryPost> {
        const node = new SC<UnaryPost>({
            type: "unary-postfix",
            isEXPRESSION: true,
            expressions: true
        });
        node.expressions.push(expression, SC.Value(operator));
        return node;
    };
    static This(): SC<Constant> {
        const node = new SC<Constant>({
            expressions: false,
            isEXPRESSION: true,
            //@ts-ignore
            type: "this",
            value: "this"
        });
        return node;
    };
    static If(expression?: SC<Expression>): SC<If> {
        const node = new SC<If>({
            type: "if",
            expressions: true,
            statements: true,
            isBLOCK: true,
            isSTATEMENT: true,
        });
        if (expression)
            node.expressions.push(expression);
        return node;
    };
    static Switch(expression: SC<Expression>): SC<Switch> {
        const node = new SC<Switch>({
            expressions: true,
            isBLOCK: true,
            isSTATEMENT: true,
            statements: true,
            type: "switch"
        });
        node.expressions.push(expression);
        return node;
    };

    static get MemberAccessor(): SC<Value> {
        return SC.Value(".");
    }

    static get False(): SC<Value> {
        return SC.Value("false");
    }

    static get True(): SC<Value> {
        return SC.Value("true");
    }

    static get Null(): SC<Value> {
        return SC.Value("null");
    };

    static get Break(): SC<Value> {
        return SC.Value("break");
    };

    static get Return(): SC<Value> {
        return SC.Value("return");
    };

    get value() {
        return (<SC<Node>>this).type.value;
    }

    /**
     * Copies statements from source into the calling node's statements list. 
     */
    mergeStatement(this: SC<T>, source: SC<Node>) {
        this.statements.push(...source.statements);
    };

    addStatement(this: SC<T>, ...stmts: SC<Node>[]): SC<T> {
        for (const stmt of stmts.filter(_ => !!_)) {
            if (acceptsStatements(<any>this.type)) {
                if (isSwitch(<any>this.type)) {
                    if (isIf(stmt.type)) {
                        this.statements.push(<SC<If>>stmt);
                    } else
                        throw new Error("Only if statements with a value or const expression can be added to switch blocks");
                } else {
                    if (isStatement(stmt.type))
                        this.statements.push(<SC<Statement>>stmt);
                    else if (isExpression(stmt.type))
                        this.statements.push(SC.Expressions(<SC<Expression>>stmt));
                }
            } else
                throw new Error("Unable to add statement to non block-like");
        }
        return this;
    }

    renderCode(this: SC<Node>): string {
        const proto = this.constructor.prototype;
        return this.render(false, proto).join("\n");
    }

    render(this: SC<Node>, use_type_info = false, proto: SC, tab: number = 0) {

        switch (this.type.type) {
            case "declare": return proto.renderDeclare.call(this, use_type_info, proto, tab);
            case "member": return proto.renderMember.call(this, use_type_info, proto, tab);
            case "group": return proto.renderGroup.call(this, use_type_info, proto, tab);
            case "function": return proto.renderFunction.call(this, use_type_info, proto, tab);
            case "call": return proto.renderCall.call(this, use_type_info, proto, tab);
            case "comment": return proto.renderComment.call(this, use_type_info, proto, tab);
            case "expressions": return proto.renderExpressions.call(this, use_type_info, proto, tab);
            case "variable": return proto.renderVariable.call(this, use_type_info, proto, tab);
            case "constant": return proto.renderConstant.call(this, use_type_info, proto, tab);
            case "assign": return proto.renderAssignment.call(this, use_type_info, proto, tab);
            case "class": return proto.renderClass.call(this, use_type_info, proto, tab);
            case "value": return proto.renderValue.call(this, use_type_info, proto, tab);
            case "while": return proto.renderWhile.call(this, use_type_info, proto, tab);
            case "this": return proto.renderThis.call(this, use_type_info, proto, tab);
            case "if": return proto.renderIf.call(this, use_type_info, proto, tab);
            case "switch": return proto.renderSwitch.call(this, use_type_info, proto, tab);
            case "binary": return proto.renderBinary.call(this, use_type_info, proto, tab);
            case "unary-prefix": return proto.renderUnaryPre.call(this, use_type_info, proto, tab);
            case "unary-postfix": return proto.renderUnaryPost.call(this, use_type_info, proto, tab);
            default:
                return this.statements.flatMap(s => s.render(use_type_info, proto, tab));
        }
        return [];
    }
    renderDeclare(this: SC<Declare>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderMember(this: SC<Member>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderGroup(this: SC<Group>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderComment(this: SC<Comment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderFunction(this: SC<Function>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderCall(this: SC<Call>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderExpressions(this: SC<Expressions>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderVariable(this: SC<Variable>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderConstant(this: SC<Constant>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderAssignment(this: SC<Assignment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderClass(this: SC<Class>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderValue(this: SC<Value>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderWhile(this: SC<While>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderThis(this: SC<This>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderIf(this: SC<If>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderSwitch(this: SC<Switch>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderBinary(this: SC<Binary>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderUnaryPre(this: SC<UnaryPre>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderUnaryPost(this: SC<UnaryPost>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };

    isEmptyIf(this: SC<Node>) {
        if (isIf(this.type)) {
            if (!this.expressions[0]) return true;
        }
        return false;
    }
    /**
     * Return MD5 hash of the AST 
     * @param this 
     */
    hash(this: SC<Node>, root = true): string {
        const extended_exp_hash = (this.expressions ?? []).map(s => s.hash(false)).join("");
        const extended_stmt_hash = (this.statements ?? []).map(s => s.hash(false)).join("");

        const own_hash_data = [
            this.type?.type ?? "",
            this.type?.value ?? "",
            this.type?.val_type ?? "",
        ];

        if (root) {
            return crypto.createHash('md5').update([
                own_hash_data.join(""),
                extended_exp_hash,
                extended_stmt_hash
            ].join("")).digest("hex");
        } else {
            return [
                own_hash_data.join(""),
                extended_exp_hash,
                extended_stmt_hash
            ].join("");
        }
    }

    replaceVariableValue(this: SC<Node>, original_val: string, new_val: string) {
        if (this.type.type == "constant" || this.type.type == "variable") {
            if (this.type.value == original_val)
                this.type.value = new_val;
        }
        else {
            for (const node of this.expressions ?? [])
                node.replaceVariableValue(original_val, new_val);
            for (const node of this.statements ?? [])
                node.replaceVariableValue(original_val, new_val);
        }
    }

    modifyIdentifiers(this: SC<Node>, fn): SC<any> {

        if (this.type.type == "constant" || this.type.type == "variable") {
            return fn(this) || this;
        } else {
            if (this.expressions)
                this.expressions = this.expressions.map(s => s.modifyIdentifiers(fn));
            if (this.statements)
                this.statements = this.statements.map(s => s.modifyIdentifiers(fn));
        }
        return this;
    }
}

const CPP_PrimitiveToAssemblyScript = {
    "bool": "boolean",
    "long": "i64",
    "int": "i32",
    "short": 'i16',
    "char": "i8",
    "unsigned long": "u32",
    "unsigned int": "u32",
    "unsigned short": 'u16',
    "unsigned char": "u8",
    "float": "f32",
    "double": "f64",
};

function ConvertCPPTypeToAS(type: string) {
    const adjusted = type.replace(/\s+/g, " ").replace(/(\*+|\&+)/g, "").trim();
    return CPP_PrimitiveToAssemblyScript[adjusted.toLowerCase()] ?? adjusted.split(" ")[0];
}

function isBindingExpression(node: SC<Expression>) {
    switch (node.type.type) {
        case "unary-pre":
        case "unary-post":
        case "binary":
            return true;
    }
    return false;
}

function getVarType(node: SC<Member | Constant | Assignment | Variable>) {

    switch (node.type.type) {
        case "assign":
        case "member":
            return getVarType(<any>node.expressions[0]);
        case "constant":
            return "constant";
        case "variable":
            return "variable";
    }

    return "";
}

function getVar(node: SC<Member | Constant | Assignment | Variable>): SC<Constant | Variable> {

    switch (node.type.type) {
        case "assign":
        case "member":
            return getVar(<any>node.expressions[0]);;
        case "constant":
        case "variable":
            return <SC<Variable | Constant>>node;
    }

    return null;
}
export class JS extends SC {
    renderDeclare(this: SC<Declare>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expressions = [];

        for (const obj of this.expressions) {
            const
                type = getVarType(<any>obj),
                expr = obj.render(true, proto, 0);

            if (expr)
                if (type == "constant") {
                    expressions.push(TAB(tab) + "const " + expr + ";");
                } else {
                    expressions.push(TAB(tab) + "let " + expr + ";");
                }
        }
        return expressions;
    };

    renderMember(this: SC<Member>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(false, proto, 0) + "." + this.expressions[1].render(false, proto, 0)];
    };
    renderGroup(this: SC<Group>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions.filter(s => !!s).flatMap(s => s.render(use_type_info, proto, 0)).join(",");
        if (!expr) return [];

        const
            start_sentinel = ({
                "[": "[",
                "]": "[",
                "(": "(",
                ")": "(",
                "{": "{",
                "}": "{",
            })[this.type.value] ?? this.type.value,
            end_sentinel = ({
                "[": "]",
                "]": "]",
                "(": ")",
                ")": ")",
                "{": "}",
                "}": "}",
            })[this.type.value] ?? this.type.value;

        return [start_sentinel + TAB(tab) + expr + end_sentinel];
    };

    renderComment(this: SC<Comment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const v = (this.type.value + "").replace(/\*\//g, "* /").split("\n");
        v[0] = "/*" + v[0];
        v[v.length - 1] += "*/";
        //return []; 
        return [TAB(tab) + (v.join("\n" + TAB(tab)))];
    };
    renderFunction(this: SC<Function>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].type.value;
        return [
            `function ${name}(${this.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}){`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            "}"
        ];
    };
    renderCall(this: SC<Call>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto).join("");

        return [
            `${name}(${this.expressions.slice(1).flatMap(s => s.render(false, proto, 0)).join(",")})`
        ];
    };
    renderExpressions(this: SC<Expressions>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions.flatMap(s => s.render(use_type_info, proto, 0)).join(",");
        if (!expr) return [];
        return [TAB(tab) + expr + ";"];
    };
    renderVariable(this: SC<Variable>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value];
    };
    renderConstant(this: SC<Constant>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value];
    };
    renderAssignment(this: SC<Assignment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(use_type_info, proto, 0) + " = " + this.expressions[1].render(false, proto, 0)];
    };
    renderClass(this: SC<Class>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto, 0).join("");
        const out = [TAB(tab) + `class ${name} {`];
        for (const stmt of this.statements) {
            switch (stmt.type.type) {
                case "function": {
                    const
                        name = stmt.expressions[0].type.value,
                        type = ConvertCPPTypeToAS(stmt.expressions[0].type.val_type);

                    out.push(
                        TAB(tab + 1) + `${name}(${stmt.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}){`,
                        ...stmt.statements.flatMap(s => s.render(false, proto, tab + 2)),
                        TAB(tab + 1) + "}");
                } break;

            }

        }
        out.push(TAB(tab) + "}");
        return out;
    };
    renderValue(this: SC<Value>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        if (!this.type.value) return [];
        return [this.type.value];
    };
    renderWhile(this: SC<While>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0].render(false, proto, tab).join("");
        return [
            TAB(tab) + `while(${expr}){`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            TAB(tab) + `}`
        ];
    };
    renderThis(this: SC<This>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return ["this"]; };
    renderIf(this: SC<If>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0] && this.expressions[0].render(false, proto, tab).join("");
        let stmts = this.statements, _else = null;
        if (this.statements.length > 0 && isIf(this.statements[this.statements.length - 1].type)) {
            stmts = this.statements.slice(0, -1);
            _else = this.statements.slice(-1)[0];
        }
        const ret = [];

        if (stmts.length == 0) {
            ret.push(TAB(tab) + `if(${expr || "true"})`);
            ret.push(
                ...stmts.flatMap(s => s.render(false, proto, tab + 1)),
                "");
        } else {
            if (expr) ret.push(TAB(tab) + `if(${expr}){`);
            else ret.push(TAB(tab) + "{");
            ret.push(
                ...stmts.flatMap(s => s.render(false, proto, tab + 1)),
                TAB(tab) + `}`
            );
        }

        if (_else) {
            const else_str = _else.render(false, proto, tab);
            let last = ret.pop();
            last += " else " + else_str.shift().trim();
            ret.push(last, ...else_str);
        }

        return ret;
    };
    renderSwitch(this: SC<Switch>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0].render(false, proto, tab);
        return [
            TAB(tab) + `switch(${expr}){`,
            ...this.statements.flatMap(s => {
                const expr = s.expressions[0].render(false, proto, 0).join("");
                return [
                    TAB(tab + 1) + (expr.trim() == "default" ? "default:" : `case ${expr}:`),
                    ...s.statements.flatMap(s => s.render(false, proto, tab + 2))
                ];
            }
            ),
            TAB(tab) + `}`,
        ];
    };
    renderBinary(this: SC<Binary>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const [a, b, c] = this.expressions;
        return [[
            isBindingExpression(a) ? `(${a.render(false, proto, 0).join("")})` : a.render(false, proto, 0),
            b.render(false, proto, 0),
            isBindingExpression(c) ? `(${c.render(false, proto, 0).join("")})` : c.render(false, proto, 0),
        ].join("")];
    };
    renderUnaryPre(this: SC<UnaryPre>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const pre = this.expressions[0].render(false, proto, 0).join("");
        const space = (!((new Lexer(pre)).ty & (Lexer.types.id | Lexer.types.num))) ? "" : " ";

        return [pre + space + this.expressions[1].render(false, proto, 0).join("")];
    };
    renderUnaryPost(this: SC<UnaryPost>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const post = this.expressions[1].render(false, proto, 0).join("").trim();
        const space = (!((new Lexer(post)).ty & (Lexer.types.id | Lexer.types.num))) ? "" : " ";

        return [this.expressions[0].render(false, proto, 0).join("") + space + post];
    };
}
/**
 * AssemblyScript
 */
export class AS extends JS {
    renderFunction(this: SC<Function>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const
            name = this.expressions[0].type.value,
            type = ConvertCPPTypeToAS(this.expressions[0].type.val_type),
            templates = this.expressions[0].expressions.slice(1).map(s => s.render(false, proto)).join(",");

        return [
            `function ${name}${templates ? `<${templates}>` : ""}(${this.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}):${type}{`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            "}"
        ];
    };
    renderCall(this: SC<Call>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto).join(""),
            templates = getVar(<any>this.expressions[0])
                ?.expressions
                .map(getVar)
                .filter(s => !!s)
                .map(s => s.type.val_type)
                .filter(s => !!s)
                .map(ConvertCPPTypeToAS)
                .join(",");

        return [
            `${name}${templates ? `<${templates}>` : ""}(${this.expressions.slice(1).flatMap(s => s.render(false, proto, 0)).join(",")})`
        ];
    };
    renderVariable(this: SC<Variable>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value + (use_type_info ? ":" + ConvertCPPTypeToAS(this.type.val_type) : "")];
    };
    renderConstant(this: SC<Constant>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value + (use_type_info ? ":" + ConvertCPPTypeToAS(this.type.val_type) : "")];
    };
    renderClass(this: SC<Class>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto, 0).join("");
        const out = [TAB(tab) + `class ${name} {`];
        for (const stmt of this.statements) {
            switch (stmt.type.type) {
                case "declare":
                    for (const expr of stmt.expressions)
                        out.push(TAB(tab + 1) + expr.render(true, proto, tab + 1).join("") + ";");
                    break;
                case "function": {
                    const
                        name = stmt.expressions[0].type.value,
                        type = ConvertCPPTypeToAS(stmt.expressions[0].type.val_type);

                    out.push(
                        TAB(tab + 1) + `${name}(${stmt.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")})${type ? ":" + type : ""}{`,
                        ...stmt.statements.flatMap(s => s.render(false, proto, tab + 2)),
                        TAB(tab + 1) + "}");
                } break;

            }

        }
        out.push(TAB(tab) + "}");
        return out;
    };
}




export class RS extends SC {
    renderDeclare(this: SC<Declare>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions.flatMap(s => s.render(true, proto, 0)).join(",");
        if (!expr) return [];
        return [TAB(tab) + "let " + expr + ";"];
    };

    renderMember(this: SC<Member>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(false, proto, 0) + "." + this.expressions[1].render(false, proto, 0)];
    };
    renderGroup(this: SC<Group>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions.flatMap(s => s.render(use_type_info, proto, 0)).join(",");
        if (!expr) return [];

        const
            start_sentinel = ({
                "[": "[",
                "]": "[",
                "(": "(",
                ")": "(",
                "{": "{",
                "}": "{",
            })[this.type.value] ?? this.type.value,
            end_sentinel = ({
                "[": "]",
                "]": "]",
                "(": ")",
                ")": ")",
                "{": "}",
                "}": "}",
            })[this.type.value] ?? this.type.value;

        return [start_sentinel, TAB(tab) + expr, end_sentinel];
    };

    renderComment(this: SC<Comment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return [""]; };
    renderFunction(this: SC<Function>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const
            name = this.expressions[0].type.value,
            type = this.expressions[0].type.val_type;

        return [
            `fn ${name}(${this.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}){`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            "}"
        ];
    };
    renderCall(this: SC<Call>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto).join("");

        return [
            `${name}(${this.expressions.slice(1).flatMap(s => s.render(false, proto, 0)).join(",")})`
        ];
    };
    renderExpressions(this: SC<Expressions>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions.flatMap(s => s.render(use_type_info, proto, 0)).join(",");
        if (!expr) return [];
        return [TAB(tab) + expr + ";"];
    };
    renderVariable(this: SC<Variable>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value + (use_type_info ? ":" + this.type.val_type : "")];
    };
    renderConstant(this: SC<Constant>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.type.value + (use_type_info ? ":" + this.type.val_type : "")];
    };
    renderAssignment(this: SC<Assignment>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(use_type_info, proto, 0) + " = " + this.expressions[1].render(false, proto, 0)];
    };
    renderClass(this: SC<Class>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto, 0).join("");
        const out = [TAB(tab) + `class ${name} {`];
        for (const stmt of this.statements) {
            switch (stmt.type.type) {
                case "declare":
                    for (const expr of stmt.expressions)
                        out.push(TAB(tab + 1) + expr.render(true, proto, tab + 1).join("") + ";");
                    break;
                case "function": {
                    const
                        name = stmt.expressions[0].type.value,
                        type = ConvertCPPTypeToAS(stmt.expressions[0].type.val_type);

                    out.push(
                        TAB(tab + 1) + `${name}(${stmt.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")})${type ? ":" + type : ""}{`,
                        ...stmt.statements.flatMap(s => s.render(false, proto, tab + 2)),
                        TAB(tab + 1) + "}");
                } break;

            }

        }
        out.push(TAB(tab) + "}");
        return out;
    };
    renderValue(this: SC<Value>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        if (!this.type.value) return [];
        return [this.type.value];
    };
    renderWhile(this: SC<While>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0].render(false, proto, tab).join("");
        return [
            TAB(tab) + `while(${expr}){`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            TAB(tab) + `}`
        ];
    };
    renderThis(this: SC<This>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return ["this"]; };
    renderIf(this: SC<If>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0] && this.expressions[0].render(false, proto, tab).join("");
        let stmts = this.statements, _else = null;
        if (this.statements.length > 0 && isIf(this.statements[this.statements.length - 1].type)) {
            stmts = this.statements.slice(0, -1);
            _else = this.statements.slice(-1)[0];
        }
        const ret = [];

        if (stmts.length == 0) {
            ret.push(TAB(tab) + `if ${expr || "true"} `);
            ret.push(
                ...stmts.flatMap(s => s.render(false, proto, tab + 1)),
                "");
        } else {
            if (expr) ret.push(TAB(tab) + `if ${expr} {`);
            else ret.push(TAB(tab) + "{");
            ret.push(
                ...stmts.flatMap(s => s.render(false, proto, tab + 1)),
                TAB(tab) + `}`
            );
        }

        if (_else) {
            const else_str = _else.render(false, proto, tab);
            let last = ret.pop();
            last += " else " + else_str.shift().trim();
            ret.push(last, ...else_str);
        }

        return ret;
    };
    renderSwitch(this: SC<Switch>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const expr = this.expressions[0].render(false, proto, tab);
        return [
            TAB(tab) + `match ${expr} {`,
            ...this.statements.flatMap(s =>
                [
                    TAB(tab + 1) + `${s.expressions[0].render(false, proto, 0)} => `,
                    ...s.statements.flatMap(s => s.render(false, proto, tab + 2)),
                    TAB(tab + 1) + ","

                ]
            ),
            TAB(tab) + `};`,
        ];
    };
    renderBinary(this: SC<Binary>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions.map(s => s.render(false, proto, 0)).join("")];
    };
    renderUnaryPre(this: SC<UnaryPre>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(false, proto, 0) + "" + this.expressions[1].render(false, proto, 0)];
    };
    renderUnaryPost(this: SC<UnaryPost>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [this.expressions[0].render(false, proto, 0) + "" + this.expressions[1].render(false, proto, 0)];
    };
}
export class CPP extends AS {
    renderDeclare(this: SC<Declare>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        //Sort into groups
        return this.expressions.map(s => TAB(tab) + s.render(true, proto, 0) + ";");
    };

    renderMember(this: SC<Member>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        if (this.expressions[0].type.type == "this") return this.expressions[1].render(false, proto, 0);
        return [this.expressions[0].render(false, proto, 0) + "." + this.expressions[1].render(false, proto, 0)];
    };

    renderFunction(this: SC<Function>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const
            name = this.expressions[0].type.value,
            type = this.expressions[0].type.val_type;

        return [
            `${type} ${name}(${this.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}){`,
            ...this.statements.flatMap(s => s.render(false, proto, tab + 1)),
            "}"
        ];
    };
    renderCall(this: SC<Call>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto).join("");

        return [
            `${name}(${this.expressions.slice(1).flatMap(s => s.render(false, proto, 0)).join(",")})`
        ];
    };
    renderVariable(this: SC<Variable>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [(use_type_info ? "" + this.type.val_type : "") + " " + this.type.value];
    };
    renderConstant(this: SC<Constant>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        return [(use_type_info ? "const " + this.type.val_type : "") + " " + this.type.value];
    };
    renderClass(this: SC<Class>, use_type_info: boolean, proto: SC, tab: number = 0): string[] {
        const name = this.expressions[0].render(use_type_info, proto, 0).join("");
        const out = [TAB(tab) + `class ${name} {`, `public:`];
        for (const stmt of this.statements) {
            switch (stmt.type.type) {
                case "declare":
                    for (const expr of stmt.expressions)
                        out.push(TAB(tab + 1) + expr.render(true, proto, tab + 1).join("") + ";");
                    break;
                case "function": {
                    const
                        name = stmt.expressions[0].type.value,
                        type = ConvertCPPTypeToAS(stmt.expressions[0].type.val_type);

                    out.push(
                        TAB(tab + 1) + `${type ? "" + type : ""} ${name}(${stmt.expressions.slice(1).flatMap(s => s.render(true, proto, 0)).join(",")}){`,
                        ...stmt.statements.flatMap(s => s.render(false, proto, tab + 2)),
                        TAB(tab + 1) + "}");
                } break;

            }

        }
        out.push(TAB(tab) + "};");
        return out;
    };
    renderThis(this: SC<This>, use_type_info: boolean, proto: SC, tab: number = 0): string[] { return ["this"]; };
}
export type ExprSC = SC<Expression>;
export type ConstSC = SC<Constant>;
export type VarSC = SC<Variable>;

export type StmtSC = SC<Statement>;

export type BlockSC = SC<Block>;

export type IfSC = SC<Block>;