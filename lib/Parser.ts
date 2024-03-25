import { ParseError } from './Error.js';
import * as Expr from './Expr.js';
import Lox from './Lox.js';
import { Token } from './Token.js';
import { TokenType as TT } from './TokenType.js';
import * as Stmt from './Stmt.js';

type Expression = Expr.Expr;
type Statement = Stmt.Stmt;
export class Parser {
  private current: number = 0;
  constructor(private readonly tokens: Array<Token>) {}

  parse(): Array<Statement> {
    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }

    return statements;
  }

  private statement(): Statement {
    if (this.match(TT.PRINT)) return this.printStatement();

    return this.expressionStatement();
  }

  private expressionStatement(): Statement {
    const expr = this.expression();
    this.consume(TT.SEMICOLON, "Expect ';' after value.");
    return new Stmt.ExpressionStmt(expr);
  }

  private printStatement(): Statement {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expect ';' after value.");
    return new Stmt.PrintStmt(value);
  }

  private expression(): Expression {
    return this.equality();
  }

  private equality(): Expression {
    let expr = this.comparison();

    while (this.match(TT.BANG_EQUAL, TT.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();

    while (this.match(TT.GREATER, TT.GREATER_EQUAL, TT.LESS, TT.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expression {
    let expr = this.factor();

    while (this.match(TT.MINUS, TT.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TT.SLASH, TT.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expression {
    if (this.match(TT.BANG, TT.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expression {
    if (this.match(TT.FALSE)) return new Expr.Literal(false);
    if (this.match(TT.TRUE)) return new Expr.Literal(true);
    if (this.match(TT.NIL)) return new Expr.Literal(null);

    if (this.match(TT.NUMBER, TT.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TT.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TT.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.ParseError(this.peek(), 'Expect expression.');
  }

  private match(...types: TT[]): boolean {
    if (types.filter((type) => this.check(type)).length) {
      this.advance();
      return true;
    }

    return false;
  }

  private consume(type: TT, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.ParseError(this.peek(), message);
  }

  private ParseError(token: Token, message: string): Error {
    Lox.parseError(token, message);
    return new ParseError(message);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TT.SEMICOLON) return;

      switch (this.peek().type) {
        case TT.CLASS:
        case TT.FUN:
        case TT.VAR:
        case TT.FOR:
        case TT.IF:
        case TT.WHILE:
        case TT.PRINT:
        case TT.RETURN:
          return;
      }

      this.advance();
    }
  }

  private check(type: TT): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TT.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
