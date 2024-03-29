import { Expression, NullableObj, Statement } from './@types/index.js';
import Environment from './Environment.js';
import { RuntimeError } from './Error.js';
import * as Expr from './Expr.js';
import Lox from './Lox.js';
import { LoxCallable, Clock } from './LoxCallble.js';
import { LoxClass } from './LoxClass.js';
import { LoxFunction } from './LoxFunction.js';
import { LoxInstance } from './LoxInstance.js';
import { Return } from './Return.js';
import * as Stmt from './Stmt.js';
import { Token } from './Token.js';
import { TokenType as TT } from './TokenType.js';
import colors from 'colors';

export class Interpreter
  implements Expr.Visitor<NullableObj>, Stmt.Visitor<void>
{
  readonly globals: Environment = new Environment();
  private environment: Environment = this.globals;
  private locals: Map<Expression, number> = new Map();

  constructor() {
    this.globals.define('clock', new Clock());
  }

  public interpret(input: Array<Statement> | Expression): string | void {
    try {
      return Array.isArray(input)
        ? this.interpretStmt(input)
        : this.interpretExpr(input);
    } catch (err) {
      Lox.runtimeError(err);
    }
  }

  private interpretStmt(statements: Array<Statement>): void {
    statements.forEach((stmt) => this.execute(stmt));
  }

  private interpretExpr(expression: Expression): string {
    const value = this.evaluate(expression);
    return this.stringify(value);
  }

  private execute(stmt: Statement): void {
    stmt.accept(this);
  }

  resolve(expr: Expression, depth: number) {
    this.locals.set(expr, depth);
  }

  executeBlock(statements: Array<Statement>, env: Environment): void {
    const previous = this.environment;

    try {
      this.environment = env;

      statements.forEach((stmt) => this.execute(stmt));
    } finally {
      this.environment = previous;
    }
  }

  visitBinaryExpr(expr: Expr.Binary): NullableObj {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    if (left === null || right === null) return null;

    switch (expr.operator.type) {
      case TT.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return +left > +right;
      case TT.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return +left >= +right;
      case TT.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return +left < +right;
      case TT.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return +left <= +right;
      case TT.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return +left - +right;
      case TT.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        if (right === 0)
          throw new RuntimeError(expr.operator, 'Division by zero.');
        return +left / +right;
      case TT.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return +left * +right;
      case TT.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return +left + +right;
        }
        if (
          (typeof left === 'string' || typeof left === 'number') &&
          (typeof right === 'string' || typeof right === 'number')
        ) {
          return left.toString() + right.toString();
        }
        throw new RuntimeError(
          expr.operator,
          'Operands must be two numbers or two strings.'
        );
      case TT.BANG_EQUAL:
        return left !== right;
      case TT.EQUAL_EQUAL:
        return left === right;
    }

    return null;
  }

  visitCallExpr(expr: Expr.Call): NullableObj {
    const callee = this.evaluate(expr.callee);

    const args: Array<NullableObj> = [];
    expr.args.forEach((arg) => args.push(this.evaluate(arg)));

    if (!this.isCallable(callee)) {
      throw new RuntimeError(
        expr.paren,
        'Can only call functions and classes.'
      );
    }

    const func = callee as LoxCallable;
    if (args.length !== func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity} arguments but got ${args.length}.`
      );
    }

    return func.call(this, args);
  }

  visitGetExpr(expr: Expr.Get): NullableObj {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, 'Only instances have properties.');
  }

  isCallable(callee: NullableObj): callee is LoxCallable {
    return (callee as LoxCallable).call !== undefined;
  }

  visitGroupingExpr(expr: Expr.Grouping): NullableObj {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): NullableObj {
    return expr.value ?? 'nil';
  }

  visitLogicalExpr(expr: Expr.Logical): NullableObj {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TT.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitSetExpr(expr: Expr.SetExpr): NullableObj {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, 'Only instances have fields.');
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: Expr.This): NullableObj {
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitUnaryExpr(expr: Expr.Unary): NullableObj {
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TT.BANG:
        return !this.isTruthy(right);
      case TT.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -(Number(right) as number);
    }

    return null;
  }

  visitVariableExpr(expr: Expr.Variable): NullableObj {
    return this.lookUpVariable(expr.name, expr);
  }

  private lookUpVariable(name: Token, expr: Expression): NullableObj {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  visitAssignExpr(expr: Expr.Assign): NullableObj {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  visitFunctionExpr(expr: Expr.Function): NullableObj {
    return new LoxFunction(null, expr, this.environment, false);
  }

  private evaluate(expr: Expr.Expr): NullableObj {
    return expr.accept(this);
  }

  visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    const func = new LoxFunction(
      stmt.name.lexeme,
      stmt.func,
      this.environment,
      false
    );
    this.environment.define(stmt.name.lexeme, func);
  }

  visitIfStmt(stmt: Stmt.IfStmt): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Stmt.PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitReturnStmt(stmt: Stmt.ReturnStmt): void {
    let value: NullableObj = null;
    if (stmt.value) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitVarStmt(stmt: Stmt.VarStmt): void {
    let value: NullableObj = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt: Stmt.WhileStmt): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitClassStmt(stmt: Stmt.ClassStmt): void {
    this.environment.define(stmt.name.lexeme, null);

    const methods = new Map();

    stmt.methods.forEach((method) => {
      const func = new LoxFunction(
        method.name.lexeme,
        method.func,
        this.environment,
        method.name.lexeme === 'init'
      );
      methods.set(method.name.lexeme, func);
    });

    const klass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
  }

  private isTruthy(object: NullableObj): boolean {
    if (object === null || object === 'nil') return false;
    if (typeof object === 'boolean') return Boolean(object);
    return true;
  }

  private checkNumberOperand(operator: Token, operand: NullableObj): void {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(
    operator: Token,
    left: NullableObj,
    right: NullableObj
  ): void {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  private stringify(object: NullableObj): string {
    if (object === null || object === 'nil') return colors.magenta('nil');
    switch (typeof object) {
      case 'string':
        return colors.cyan(object.toString());
      case 'number':
        return colors.green(object.toString());
      case 'boolean':
        return colors.blue(object.toString());
      default:
        return colors.white(object.toString());
    }
  }

  // Expressions
  visitSuperExpr(expr: Expr.Super): NullableObj {
    throw new Error('Method not implemented.');
  }
}
