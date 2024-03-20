import * as Expr from './Expr';

export class AstPrinter implements Expr.Visitor<string> {
  print(expr: Expr.Expr) {
    return expr.accept(this);
  }

  visitAssignExpr(expr: Expr.Assign): string {
    throw new Error('Method not implemented.');
  }
  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }
  visitCallExpr(expr: Expr.Call): string {
    throw new Error('Method not implemented.');
  }
  visitGetExpr(expr: Expr.Get): string {
    throw new Error('Method not implemented.');
  }
  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize('group', expr.expression);
  }
  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value === null) return 'nil';
    return expr.value.toString();
  }
  visitLogicalExpr(expr: Expr.Logical): string {
    throw new Error('Method not implemented.');
  }
  visitSetExpr(expr: Expr.SetExpr): string {
    throw new Error('Method not implemented.');
  }
  visitSuperExpr(expr: Expr.Super): string {
    throw new Error('Method not implemented.');
  }
  visitThisExpr(expr: Expr.This): string {
    throw new Error('Method not implemented.');
  }
  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }
  visitVariableExpr(expr: Expr.Variable): string {
    throw new Error('Method not implemented.');
  }

  private parenthesize(name: string, ...args: Expr.Expr[]): string {
    return `(${name} ${args.map((exp) => exp.accept(this)).join(' ')})`;
  }
}
