import { Token } from './Token';

abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
}

interface Visitor<T> {
  visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  visitCallExpr(expr: Call): T;
  visitGetExpr(expr: Get): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitSetExpr(expr: SetExpr): T;
  visitSuperExpr(expr: Super): T;
  visitThisExpr(expr: This): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}

class Assign extends Expr {
  constructor(public readonly name: Token, public readonly value: Expr) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

class Call extends Expr {
  constructor(
    public readonly callee: Expr,
    public readonly paren: Token,
    public readonly args: Array<Expr>
  ) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

class Get extends Expr {
  constructor(public readonly object: Expr, public readonly name: Token) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGetExpr(this);
  }
}

class Grouping extends Expr {
  constructor(public readonly expression: Expr) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

class Literal extends Expr {
  constructor(public readonly value: string | number | null) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

class Logical extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

class SetExpr extends Expr {
  constructor(
    public readonly object: Expr,
    public readonly name: Token,
    public readonly value: Expr
  ) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSetExpr(this);
  }
}

class Super extends Expr {
  constructor(public readonly keyword: Token, public readonly method: Token) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSuperExpr(this);
  }
}

class This extends Expr {
  constructor(public keyword: Token) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitThisExpr(this);
  }
}

class Unary extends Expr {
  constructor(public readonly operator: Token, public readonly right: Expr) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

class Variable extends Expr {
  constructor(public readonly name: Token) {
    super();
  }
  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

export {
  Expr,
  Visitor,
  Assign,
  Binary,
  Call,
  Get,
  Grouping,
  Literal,
  Logical,
  SetExpr,
  Super,
  This,
  Unary,
  Variable,
};
