import Token from './Token.js';
import { TokenType } from './TokenType.js';
import Lox from './Lox.js';

export class Scanner {
  private start: number;
  private current: number;
  private line: number;

  constructor(
    private readonly source: string,
    private readonly tokens: Array<Token> = []
  ) {
    this.start = 0;
    this.current = 0;
    this.line = 0;
  }

  scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case TokenType.LEFT_PAREN:
      case TokenType.RIGHT_PAREN:
      case TokenType.LEFT_BRACE:
      case TokenType.RIGHT_BRACE:
      case TokenType.COMMA:
      case TokenType.DOT:
      case TokenType.MINUS:
      case TokenType.PLUS:
      case TokenType.SEMICOLON:
      case TokenType.STAR:
        this.addToken(c as TokenType);
        break;
      default:
        Lox.getInstance().error(this.line, 'Unexpected character');
        break;
    }
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType): void;

  private addToken(type: TokenType, literal?: Object): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }
}
