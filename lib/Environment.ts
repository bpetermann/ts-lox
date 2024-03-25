import { NullableObj } from './@types';
import { RuntimeError } from './Error.js';
import { Token } from './Token.js';

export default class Environment {
  constructor(private readonly values: Map<string, NullableObj> = new Map()) {}

  define(name: string, value: NullableObj) {
    this.values.set(name, value);
  }

  get(name: Token): NullableObj {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme) ?? null;
    }

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }
}
