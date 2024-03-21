import { TokenType } from './TokenType.js';

export class Token {
  constructor(
    private readonly type: TokenType,
    public readonly lexeme: string,
    private readonly literal: string | number | null,
    private readonly line: number
  ) {}

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
