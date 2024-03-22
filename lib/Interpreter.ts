import { RuntimeError } from './Error.js';
import * as Expr from './Expr.js';
import Lox from './Lox.js';
import { Token } from './Token.js';
import { TokenType as TT } from './TokenType.js';

export type NullableObj = Nullable<Object>;
type Nullable<T> = T | null;

export class Interpreter implements Expr.Visitor<NullableObj> {
  public interpret(expression: Expr.Expr): void {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (err) {
      Lox.runtimeError(err);
    }
  }

  visitAssignExpr(expr: Expr.Assign): NullableObj {
    throw new Error('Method not implemented.');
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
        return +left / +right;
      case TT.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return +left * +right;
      case TT.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return +left + +right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
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
    throw new Error('Method not implemented.');
  }

  visitGetExpr(expr: Expr.Get): NullableObj {
    throw new Error('Method not implemented.');
  }

  visitGroupingExpr(expr: Expr.Grouping): NullableObj {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): NullableObj {
    return !expr.value ? 'nil' : expr.value;
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
    throw new Error('Method not implemented.');
  }

  private evaluate(expr: Expr.Expr): NullableObj {
    return expr.accept(this);
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
}
