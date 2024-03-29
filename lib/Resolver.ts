import * as Expr from './Expr.js';
import { Interpreter } from './Interpreter';
import Lox from './Lox.js';
import * as Stmt from './Stmt.js';
import { Token } from './Token.js';

enum FunctionType {
  NONE,
  FUNCTION,
}
export class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  private scopes: Array<Map<string, boolean>> = new Array();
  private currentFunction: FunctionType = FunctionType.NONE;

  constructor(private readonly interpreter: Interpreter) {}

  resolve(input: Stmt.Stmt | Expr.Expr | Array<Stmt.Stmt>): void {
    Array.isArray(input)
      ? input.forEach((s) => this.resolve(s))
      : input.accept(this);
  }

  private resolveFunction(func: Stmt.FunctionStmt, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    func.func.params.forEach((param) => {
      this.declare(param);
      this.define(param);
    });
    this.resolve(func.func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private peek(): Map<string, boolean> {
    return this.scopes[this.scopes.length - 1];
  }

  private declare(name: Token): void {
    if (!this.scopes.length) return;

    const scope = this.peek();
    if (scope.has(name.lexeme))
      Lox.parseError(name, 'Already a variable with this name in this scope.');

    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (!this.scopes.length) return;
    this.peek().set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr.Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.resolve(stmt.expression);
  }

  visitVarStmt(stmt: Stmt.VarStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer) this.resolve(stmt.initializer);
    this.define(stmt.name);
  }

  visitWhileStmt(stmt: Stmt.WhileStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitAssignExpr(expr: Expr.Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitVariableExpr(expr: Expr.Variable): void {
    if (this.scopes.length && this.peek().get(expr.name.lexeme) === false) {
      Lox.parseError(
        expr.name,
        "Can't read local variable in its own initializer."
      );
    }

    this.resolveLocal(expr, expr.name);
  }

  visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitIfStmt(stmt: Stmt.IfStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) this.resolve(stmt.elseBranch);
  }

  visitPrintStmt(stmt: Stmt.PrintStmt): void {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Stmt.ReturnStmt): void {
    if (this.currentFunction === FunctionType.NONE)
      Lox.parseError(stmt.keyword, "Can't return from top-level code.");
    if (stmt.value) this.resolve(stmt.value);
  }

  visitBinaryExpr(expr: Expr.Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Expr.Call): void {
    this.resolve(expr.callee);

    expr.args.forEach((arg) => this.resolve(arg));
  }

  visitGroupingExpr(expr: Expr.Grouping): void {
    this.resolve(expr.expression);
  }

  visitLiteralExpr(_: Expr.Literal): void {
    return;
  }

  visitLogicalExpr(expr: Expr.Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.resolve(expr.right);
  }

  visitGetExpr(expr: Expr.Get): void {
    throw new Error('Method not implemented.');
  }
  visitSetExpr(expr: Expr.SetExpr): void {
    throw new Error('Method not implemented.');
  }
  visitSuperExpr(expr: Expr.Super): void {
    throw new Error('Method not implemented.');
  }
  visitThisExpr(expr: Expr.This): void {
    throw new Error('Method not implemented.');
  }
  visitFunctionExpr(expr: Expr.Function): void {
    throw new Error('Method not implemented.');
  }
  visitClassStmt(stmt: Stmt.ClassStmt): void {
    throw new Error('Method not implemented.');
  }
}
