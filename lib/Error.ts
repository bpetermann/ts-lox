import { Token } from './Token';

export class RuntimeError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
    this.name = 'RuntimeError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}
