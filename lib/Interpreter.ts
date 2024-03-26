import { NullableObj, Statement } from './@types/index.js';
import Environment from './Environment.js';
import { RuntimeError } from './Error.js';
import * as Expr from './Expr.js';
import Lox from './Lox.js';
import * as Stmt from './Stmt.js';
import { Token } from './Token.js';
import { TokenType as TT } from './TokenType.js';

export class Interpreter
  implements Expr.Visitor<NullableObj>, Stmt.Visitor<void>
{
  constructor(private environment: Environment = new Environment()) {}

  public interpret(statements: Array<Statement>): void {
    try {
      statements.forEach((stmt) => {
        if (stmt) this.execute(stmt);
      });
    } catch (err) {
      Lox.runtimeError(err);
    }
  }

  private execute(stmt: Statement): void {
    stmt.accept(this);
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

  visitGroupingExpr(expr: Expr.Grouping): NullableObj {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): NullableObj {
    return expr.value ?? 'nil';
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
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr: Expr.Assign): NullableObj {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  private evaluate(expr: Expr.Expr): NullableObj {
    return expr.accept(this);
  }

  visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Stmt.PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitVarStmt(stmt: Stmt.VarStmt): void {
    let value: NullableObj = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  private isTruthy(object: NullableObj): boolean {
    if (object === null) return false;
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
    if (object === null) return 'nil';
    return object.toString();
  }

  // Expressions
  visitCallExpr(expr: Expr.Call): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitGetExpr(expr: Expr.Get): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitLogicalExpr(expr: Expr.Logical): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitSetExpr(expr: Expr.SetExpr): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitSuperExpr(expr: Expr.Super): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitThisExpr(expr: Expr.This): NullableObj {
    throw new Error('Method not implemented.');
  }

  // Statements

  visitClassStmt(stmt: Stmt.ClassStmt): void {
    throw new Error('Method not implemented.');
  }

  visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    throw new Error('Method not implemented.');
  }
  visitIfStmt(stmt: Stmt.IfStmt): void {
    throw new Error('Method not implemented.');
  }

  visitReturnStmt(stmt: Stmt.ReturnStmt): void {
    throw new Error('Method not implemented.');
  }

  visitWhileStmt(stmt: Stmt.WhileStmt): void {
    throw new Error('Method not implemented.');
  }
}
