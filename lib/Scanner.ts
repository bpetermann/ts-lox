import Token from './Token.js';
import { TokenType as T, WhiteSpace as W } from './TokenType.js';
import Lox from './Lox.js';

export class Scanner {
  private start: number;
  private current: number;
  private line: number;
  private lox: Lox;
  private readonly keywords: Map<string, T>;

  constructor(
    private readonly source: string,
    private readonly tokens: Array<Token> = []
  ) {
    this.start = 0;
    this.current = 0;
    this.line = 0;
    this.lox = Lox.getInstance();
    this.keywords = new Map();
    this.addKeywords();
  }

  private addKeywords() {
    this.keywords.set('and', T.AND);
    this.keywords.set('class', T.CLASS);
    this.keywords.set('else', T.ELSE);
    this.keywords.set('false', T.FALSE);
    this.keywords.set('for', T.FOR);
    this.keywords.set('fun', T.FUN);
    this.keywords.set('if', T.IF);
    this.keywords.set('nil', T.NIL);
    this.keywords.set('or', T.OR);
    this.keywords.set('print', T.PRINT);
    this.keywords.set('return', T.RETURN);
    this.keywords.set('super', T.SUPER);
    this.keywords.set('this', T.THIS);
    this.keywords.set('true', T.TRUE);
    this.keywords.set('var', T.VAR);
    this.keywords.set('while', T.WHILE);
  }

  scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(T.EOF, '', null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();

    switch (c) {
      case W.WHITESPACE:
      case W.CARRIAGE_RETURN:
      case W.TAB:
        break;
      case W.NEWLINE:
        this.line++;
        break;
      case T.LEFT_PAREN:
      case T.RIGHT_PAREN:
      case T.LEFT_BRACE:
      case T.RIGHT_BRACE:
      case T.COMMA:
      case T.DOT:
      case T.MINUS:
      case T.PLUS:
      case T.SEMICOLON:
      case T.STAR:
        this.addToken(c as T);
        break;
      case T.BANG:
        this.addToken(this.match(T.EQUAL) ? T.BANG_EQUAL : T.BANG);
        break;
      case T.EQUAL:
        this.addToken(this.match(T.EQUAL) ? T.EQUAL_EQUAL : T.EQUAL);
        break;
      case T.LESS:
        this.addToken(this.match(T.EQUAL) ? T.LESS_EQUAL : T.LESS);
        break;
      case T.GREATER:
        this.addToken(this.match(T.EQUAL) ? T.GREATER_EQUAL : T.GREATER);
        break;
      case T.SLASH:
        if (this.match(T.SLASH)) {
          while (this.peek() !== W.NEWLINE && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(T.SLASH);
        }
        break;
      case T.STRING:
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.lox.error(this.line, `Unexpected character`);
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = this.keywords.get(text);
    this.addToken(!type ? T.IDENTIFIER : type);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAlpha(c: string): boolean {
    return c ? 'abcdefghijklmnopqrstuvwxyz_'.includes(c.toLowerCase()) : false;
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === T.DOT && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(T.NUMBER, +this.source.substring(this.start, this.current));
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private isDigit(c: string): boolean {
    return '0123456789'.includes(c);
  }

  private string(): void {
    while (this.peek() != T.STRING && !this.isAtEnd()) {
      if (this.peek() === W.NEWLINE) this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.lox.error(this.line, 'Unterminated string');
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(T.STRING, value);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private match(expected: T): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: T): void;
  private addToken(type: T, literal: Object): void;
  private addToken(type: T, literal?: Object): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }
}
