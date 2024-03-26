import { NullableObj } from './@types';
import { RuntimeError } from './Error.js';
import { Token } from './Token.js';

export default class Environment {
  private readonly values: Map<string, NullableObj>;

  constructor(public readonly enclosing: Environment | null = null) {
    this.values = new Map();
  }

  define(name: string, value: NullableObj) {
    this.values.set(name, value);
  }

  get(name: Token): NullableObj {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme) ?? null;
    }

    if (this.enclosing) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }

  assign(name: Token, value: NullableObj): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }
}
