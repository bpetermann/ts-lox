import * as Expr from './Expr.js';
import { Interpreter } from './Interpreter';
import Lox from './Lox.js';
import * as Stmt from './Stmt.js';
import { Token } from './Token.js';
import { Stack } from './utils/Stack.js';

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
  SUBCLASS,
}

export class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  private scopes: Stack<Map<string, boolean>> = new Stack();
  private currentFunction: FunctionType = FunctionType.NONE;
  private currentClass: ClassType = ClassType.NONE;

  constructor(private readonly interpreter: Interpreter) {}

  resolve(input: Stmt.Stmt | Expr.Expr | Array<Stmt.Stmt>): void {
    if (Array.isArray(input)) {
      for (let i = 0; i < input.length; i++) {
        this.resolve(input[i]);
      }
    } else {
      input.accept(this);
    }
  }

  private resolveFunction(func: Expr.Function, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (let i = 0; i < func.params.length; i++) {
      this.declare(func.params[i]);
      this.define(func.params[i]);
    }

    this.resolve(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (this.scopes.isEmpty()) return;

    const scope = this.scopes.peek();
    if (scope.has(name.lexeme))
      Lox.parseError(name, 'Already a variable with this name in this scope.');

    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.isEmpty()) return;
    this.scopes.peek().set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr.Expr, name: Token): void {
    for (let i = this.scopes.size() - 1; i >= 0; i--) {
      if (this.scopes.get(i)?.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.size() - 1 - i);
        return;
      }
    }
  }

  visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitClassStmt(stmt: Stmt.ClassStmt): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass && stmt.name.lexeme === stmt.superclass.name.lexeme)
      Lox.parseError(
        stmt.superclass?.name,
        "A class can't inherit from itself."
      );
    if (stmt.superclass) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolve(stmt.superclass);
    }

    if (stmt.superclass) {
      this.beginScope();
      this.scopes.peek().set('super', true);
    }

    this.beginScope();
    this.scopes.peek().set('this', true);

    for (let i = 0; i < stmt.methods.length; i++) {
      let declaration = FunctionType.METHOD;
      if (stmt.methods[i].name.lexeme === 'init') {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(stmt.methods[i].func, declaration);
    }

    this.endScope();
    if (stmt.superclass) this.endScope();

    this.currentClass = enclosingClass;
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
    if (
      !this.scopes.isEmpty() &&
      this.scopes.peek().get(expr.name.lexeme) === false
    ) {
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

    this.resolveFunction(stmt.func, FunctionType.FUNCTION);
  }

  visitFunctionExpr(expr: Expr.Function): void {
    this.resolveFunction(expr, FunctionType.FUNCTION);
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
    if (stmt.value) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        Lox.parseError(
          stmt.keyword,
          "Can't return a value from an initializer."
        );
      }

      this.resolve(stmt.value);
    }
  }

  visitBinaryExpr(expr: Expr.Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Expr.Call): void {
    this.resolve(expr.callee);

    for (let i = 0; i < expr.args.length; i++) {
      this.resolve(expr.args[i]);
    }
  }

  visitGetExpr(expr: Expr.Get): void {
    this.resolve(expr.object);
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

  visitSetExpr(expr: Expr.SetExpr): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitSuperExpr(expr: Expr.Super): void {
    if (this.currentClass === ClassType.NONE) {
      Lox.parseError(expr.keyword, "Can't use 'super' outside of a class.");
    } else if (this.currentClass !== ClassType.SUBCLASS) {
      Lox.parseError(
        expr.keyword,
        "Can't use 'super' in a class with no superclass."
      );
    }
    this.resolveLocal(expr, expr.keyword);
  }

  visitThisExpr(expr: Expr.This): void {
    if (this.currentClass === ClassType.NONE)
      return Lox.parseError(
        expr.keyword,
        "Can't use 'this' outside of a class."
      );
    this.resolveLocal(expr, expr.keyword);
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.resolve(expr.right);
  }
}
