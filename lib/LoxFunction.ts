import { NullableObj } from './@types';
import Environment from './Environment.js';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import { Return } from './Return.js';
import * as Expr from './Expr.js';
import { LoxInstance } from './LoxInstance';

export class LoxFunction implements LoxCallable {
  constructor(
    public readonly name: string | null,
    public readonly declaration: Expr.Function,
    public readonly closure: Environment,
    private readonly isInitializer: boolean
  ) {}

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const environment = new Environment(this.closure);

    this.declaration.params.forEach((p, i) =>
      environment.define(p.lexeme, args[i])
    );

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue: any) {
      if (this.isInitializer) return this.closure.getAt(0, 'this');
      return returnValue instanceof Return ? returnValue.value : null;
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this');

    return null;
  }

  toString(): string {
    if (!this.name) return '<fn>';
    return `<fn ${this.name}>`;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(
      null,
      this.declaration,
      environment,
      this.isInitializer
    );
  }

  arity(): number {
    return this.declaration.params.length;
  }
}
