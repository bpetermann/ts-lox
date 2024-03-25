import * as Expr from './Expr.js';

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
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
  }
}

class ClassStmt extends Stmt {
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
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
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
  }
}

class IfStmt extends Stmt {
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
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
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
  }
}

class VarStmt extends Stmt {
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
  }
}

class WhileStmt extends Stmt {
  override accept<T>(visitor: Visitor<T>): T {
    throw new Error('Method not implemented.');
  }
}