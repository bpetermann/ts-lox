abstract class Expr {
  abstract accept(visitor: Visitor): void;
}

interface Visitor {
  visitAssignExpr(expr: Assign): void;
  visitBinaryExpr(expr: Binary): void;
  visitCallExpr(expr: Call): void;
  visitGetExpr(expr: Get): void;
  visitGroupingExpr(expr: Grouping): void;
  visitLiteralExpr(expr: Literal): void;
  visitLogicalExpr(expr: Logical): void;
  visitSetExpr(expr: SetExpr): void;
  visitSuperExpr(expr: Super): void;
  visitThisExpr(expr: This): void;
  visitUnaryExpr(expr: Unary): void;
  visitVariableExpr(expr: Variable): void;
}

class Assign extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitAssignExpr(this);
  }
}

class Binary extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitBinaryExpr(this);
  }
}

class Call extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitCallExpr(this);
  }
}

class Get extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitGetExpr(this);
  }
}

class Grouping extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitGroupingExpr(this);
  }
}

class Literal extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitLiteralExpr(this);
  }
}

class Logical extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitSetExpr(this);
  }
}

class SetExpr extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitSetExpr(this);
  }
}

class Super extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitSuperExpr(this);
  }
}

class This extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitThisExpr(this);
  }
}

class Unary extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitUnaryExpr(this);
  }
}

class Variable extends Expr {
  override accept(visitor: Visitor): void {
    visitor.visitVariableExpr(this);
  }
}
