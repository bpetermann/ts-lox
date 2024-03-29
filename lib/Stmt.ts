import { NullableExpr } from './@types/index.js';
import * as Expr from './Expr.js';
import { Token } from './Token.js';
abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T;
}

interface Visitor<T> {
  visitBlockStmt(stmt: BlockStmt): T;
  visitClassStmt(stmt: ClassStmt): T;
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitFunctionStmt(stmt: FunctionStmt): T;
  visitIfStmt(stmt: IfStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
  visitReturnStmt(stmt: ReturnStmt): T;
  visitVarStmt(stmt: VarStmt): T;
  visitWhileStmt(stmt: WhileStmt): T;
}

class BlockStmt extends Stmt {
  constructor(public readonly statements: Array<Stmt>) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

class ClassStmt extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly superclass: Expr.Variable | null,
    public readonly methods: Array<FunctionStmt>
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitClassStmt(this);
  }
}

class ExpressionStmt extends Stmt {
  constructor(public readonly expression: Expr.Expr) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

class FunctionStmt extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly func: Expr.Function
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFunctionStmt(this);
  }
}

class IfStmt extends Stmt {
  constructor(
    public readonly condition: Expr.Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch: Stmt | null
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

class PrintStmt extends Stmt {
  constructor(public readonly expression: Expr.Expr) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}

class ReturnStmt extends Stmt {
  constructor(
    public readonly keyword: Token,
    public readonly value: Expr.Expr | null
  ) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

class VarStmt extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly initializer: NullableExpr
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}

class WhileStmt extends Stmt {
  constructor(
    public readonly condition: Expr.Expr,
    public readonly body: Stmt
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

export {
  Stmt,
  Visitor,
  BlockStmt,
  ClassStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  VarStmt,
  WhileStmt,
};
