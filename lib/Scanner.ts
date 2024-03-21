import { Token } from './Token.js';
import { TokenType as TT, WhiteSpace as W } from './TokenType.js';
import Lox from './Lox.js';

export class Scanner {
  private start: number;
  private current: number;
  private line: number;
  private readonly keywords: Map<string, TT>;

  constructor(
    private readonly source: string,
    private readonly tokens: Array<Token> = []
  ) {
    this.start = 0;
    this.current = 0;
    this.line = 0;
    this.keywords = new Map();
    this.addKeywords();
  }

  private addKeywords() {
    this.keywords.set('and', TT.AND);
    this.keywords.set('class', TT.CLASS);
    this.keywords.set('else', TT.ELSE);
    this.keywords.set('false', TT.FALSE);
    this.keywords.set('for', TT.FOR);
    this.keywords.set('fun', TT.FUN);
    this.keywords.set('if', TT.IF);
    this.keywords.set('nil', TT.NIL);
    this.keywords.set('or', TT.OR);
    this.keywords.set('print', TT.PRINT);
    this.keywords.set('return', TT.RETURN);
    this.keywords.set('super', TT.SUPER);
    this.keywords.set('this', TT.THIS);
    this.keywords.set('true', TT.TRUE);
    this.keywords.set('var', TT.VAR);
    this.keywords.set('while', TT.WHILE);
  }

  scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TT.EOF, '', null, this.line));
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
      case TT.LEFT_PAREN:
      case TT.RIGHT_PAREN:
      case TT.LEFT_BRACE:
      case TT.RIGHT_BRACE:
      case TT.COMMA:
      case TT.DOT:
      case TT.MINUS:
      case TT.PLUS:
      case TT.SEMICOLON:
      case TT.STAR:
        this.addToken(c as TT);
        break;
      case TT.BANG:
        this.addToken(this.match(TT.EQUAL) ? TT.BANG_EQUAL : TT.BANG);
        break;
      case TT.EQUAL:
        this.addToken(this.match(TT.EQUAL) ? TT.EQUAL_EQUAL : TT.EQUAL);
        break;
      case TT.LESS:
        this.addToken(this.match(TT.EQUAL) ? TT.LESS_EQUAL : TT.LESS);
        break;
      case TT.GREATER:
        this.addToken(this.match(TT.EQUAL) ? TT.GREATER_EQUAL : TT.GREATER);
        break;
      case TT.SLASH:
        if (this.match(TT.SLASH)) {
          while (this.peek() !== W.NEWLINE && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match(TT.STAR)) {
          while (
            !(this.peek() === TT.STAR && this.peekNext() === TT.SLASH) &&
            !this.isAtEnd()
          ) {
            this.advance();
          }
          this.advance();
          this.advance();
        } else {
          this.addToken(TT.SLASH);
        }
        break;
      case TT.STRING:
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, `Unexpected character`);
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = this.keywords.get(text);
    this.addToken(!type ? TT.IDENTIFIER : type);
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

    if (this.peek() === TT.DOT && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TT.NUMBER, +this.source.substring(this.start, this.current));
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private isDigit(c: string): boolean {
    return '0123456789'.includes(c);
  }

  private string(): void {
    while (this.peek() != TT.STRING && !this.isAtEnd()) {
      if (this.peek() === W.NEWLINE) this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, 'Unterminated string');
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TT.STRING, value);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private match(expected: TT): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TT): void;
  private addToken(type: TT, literal: string | number): void;
  private addToken(type: TT, literal?: string | number): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }
}
