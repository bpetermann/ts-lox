import { NullableObj } from './@types/index.js';
import { RuntimeError } from './Error.js';
import { LoxClass } from './LoxClass.js';
import { LoxFunction } from './LoxFunction.js';
import { Token } from './Token.js';

export class LoxInstance {
  private readonly fields: Map<string, NullableObj> = new Map();
  constructor(private readonly klass: LoxClass) {}

  get(name: Token): NullableObj {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) return method.bind(this);

    throw new RuntimeError(name, `Undefined property "${name.lexeme}".`);
  }

  set(name: Token, value: NullableObj): void {
    this.fields.set(name.lexeme, value);
  }

  toString() {
    return this.klass.name + ' instance';
  }
}
