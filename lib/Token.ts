import { TokenType } from './TokenType.js';
import { NullableObj } from './Interpreter.js';
export class Token {
  constructor(
    public readonly type: TokenType,
    public readonly lexeme: string,
    public readonly literal: NullableObj,
    public readonly line: number
  ) {}

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
