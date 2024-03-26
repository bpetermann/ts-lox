import * as Expr from '../Expr';
import * as Stmt from '../Stmt';

export type NullableObj = Nullable<Object>;
export type NullableExpr = Nullable<Expression>;
export type Nullable<T> = T | null;
export type Expression = Expr.Expr;
export type Statement = Stmt.Stmt;
