import { Expression, Statement } from './@types/index.js';
import { ParseError } from './Error.js';
import * as Expr from './Expr.js';
import Lox from './Lox.js';
import { Token } from './Token.js';
import { TokenType as TT } from './TokenType.js';
import * as Stmt from './Stmt.js';

export class Parser {
  private current: number = 0;
  private allowExpression: boolean = false;
  private foundExpression: boolean = false;

  constructor(private readonly tokens: Array<Token>) {}

  parseRepl(): Array<Statement> | Expression {
    this.allowExpression = true;

    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
      if (this.foundExpression) {
        const last = statements[statements.length - 1];
        return (last as Stmt.ExpressionStmt).expression;
      }

      this.allowExpression = false;
    }

    return statements;
  }

  parse(): Array<Statement> {
    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    return statements;
  }

  private declaration(): Statement | undefined {
    try {
      if (this.check(TT.FUN) && this.checkNext(TT.IDENTIFIER)) {
        this.consume(TT.FUN, '');
        return this.func('function');
      }
      if (this.match(TT.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (err) {
      this.synchronize();
    }
  }

  private statement(): Statement {
    if (this.match(TT.FOR)) return this.forStatement();
    if (this.match(TT.IF)) return this.ifStatement();
    if (this.match(TT.RETURN)) return this.returnStatement();
    if (this.match(TT.PRINT)) return this.printStatement();
    if (this.match(TT.WHILE)) return this.whileStatement();
    if (this.match(TT.LEFT_BRACE)) return new Stmt.BlockStmt(this.block());

    return this.expressionStatement();
  }

  private forStatement(): Statement {
    this.consume(TT.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer: Statement | null = null;
    if (this.match(TT.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TT.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expression | null = null;
    if (!this.check(TT.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TT.SEMICOLON, "Expect ';' after loop condition.");

    let increment: Expression | null = null;
    if (!this.check(TT.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TT.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    if (increment) {
      body = new Stmt.BlockStmt([body, new Stmt.ExpressionStmt(increment)]);
    }
    if (condition === null) condition = new Expr.Literal(true);

    body = new Stmt.WhileStmt(condition, body);

    if (initializer) {
      body = new Stmt.BlockStmt([initializer, body]);
    }

    return body;
  }

  private ifStatement(): Statement {
    this.consume(TT.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(TT.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = this.statement();
    let elseBranch: Statement | null = null;
    if (this.match(TT.ELSE)) {
      elseBranch = this.statement();
    }

    return new Stmt.IfStmt(condition, thenBranch, elseBranch);
  }

  private expressionStatement(): Statement {
    const expr = this.expression();

    if (this.allowExpression && this.isAtEnd()) {
      this.foundExpression = true;
    } else {
      this.consume(TT.SEMICOLON, "Expect ';' after value.");
    }

    return new Stmt.ExpressionStmt(expr);
  }

  private func(kind: string): Stmt.FunctionStmt {
    const name = this.consume(TT.IDENTIFIER, `Expect ${kind} name.`);
    return new Stmt.FunctionStmt(name, this.functionBody(kind));
  }

  private functionBody(kind: string): Expr.Function {
    this.consume(TT.LEFT_PAREN, `Expect '(' after ${kind} name.`);
    const parameters: Array<Token> = [];
    if (!this.check(TT.RIGHT_PAREN)) {
      do {
        if (parameters.length >= 8) {
          this.ParseError(this.peek(), "Can't have more than 8 parameters.");
        }

        parameters.push(this.consume(TT.IDENTIFIER, 'Expect parameter name.'));
      } while (this.match(TT.COMMA));
    }
    this.consume(TT.RIGHT_PAREN, "Expect ')' after parameters.");

    this.consume(TT.LEFT_BRACE, `Expect '{' before  ${kind} body.`);
    const body = this.block();

    return new Expr.Function(parameters, body);
  }

  private block(): Array<Statement> {
    const statements: Array<Statement> = [];

    while (!this.check(TT.RIGHT_BRACE) && !this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    this.consume(TT.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private printStatement(): Statement {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expect ';' after value.");
    return new Stmt.PrintStmt(value);
  }

  private returnStatement() {
    const keyword = this.previous();
    let value: Expression | null = null;

    if (!this.check(TT.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TT.SEMICOLON, "Expect ';' after return value.");
    return new Stmt.ReturnStmt(keyword, value);
  }

  private varDeclaration(): Statement {
    const name = this.consume(TT.IDENTIFIER, 'Expect variable name.');

    let initializer: Expression | null = null;
    if (this.match(TT.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TT.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.VarStmt(name, initializer);
  }

  private whileStatement(): Stmt.WhileStmt {
    this.consume(TT.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(TT.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new Stmt.WhileStmt(condition, body);
  }

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const expr = this.or();

    if (this.match(TT.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.Variable) {
        const name = (expr as Expr.Variable).name;
        return new Expr.Assign(name, value);
      }

      throw this.ParseError(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  private or(): Expression {
    let expr = this.and();

    while (this.match(TT.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expression {
    let expr = this.equality();

    while (this.match(TT.AND)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
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

    return this.call();
  }

  private finishCall(callee: Expression) {
    const args: Expression[] = [];

    if (!this.check(TT.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.ParseError(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TT.COMMA));
    }

    const paren = this.consume(TT.RIGHT_PAREN, "Expect ')' after arguments.");

    return new Expr.Call(callee, paren, args);
  }

  private call() {
    let expr = this.primary();

    while (true) {
      if (this.match(TT.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expression {
    if (this.match(TT.FALSE)) return new Expr.Literal(false);
    if (this.match(TT.TRUE)) return new Expr.Literal(true);
    if (this.match(TT.FUN)) return this.functionBody('function');
    if (this.match(TT.NIL)) return new Expr.Literal(null);
    if (this.match(TT.NUMBER, TT.STRING))
      return new Expr.Literal(this.previous().literal);

    if (this.match(TT.IDENTIFIER)) return new Expr.Variable(this.previous());

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

  private checkNext(tokenType: TT) {
    if (this.isAtEnd()) return false;
    if (this.tokens[this.current + 1].type === TT.EOF) return false;
    return this.tokens[this.current + 1].type === tokenType;
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
