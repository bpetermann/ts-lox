import { NullableObj } from './@types';
import Environment from './Environment.js';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import { Return } from './Return.js';
import * as Expr from './Expr.js';

export class LoxFunction implements LoxCallable {
  public readonly arity: number;

  constructor(
    public readonly name: string | null,
    public readonly declaration: Expr.Function,
    public readonly closure: Environment
  ) {
    this.arity = declaration.params.length;
  }

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const environment = new Environment(this.closure);

    this.declaration.params.forEach((p, i) =>
      environment.define(p.lexeme, args[i])
    );

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue: any) {
      return returnValue instanceof Return ? returnValue.value : null;
    }
    return null;
  }

  toString(): string {
    if (!this.name) return '<fn>';
    return `<fn ${this.name}>`;
  }
}
