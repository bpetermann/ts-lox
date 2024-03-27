import { NullableObj } from './@types';
import Environment from './Environment.js';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import * as Stmt from './Stmt.js';

export class LoxFunction implements LoxCallable {
  public readonly arity: number;

  constructor(public readonly declaration: Stmt.FunctionStmt) {
    this.arity = declaration.params.length;
  }

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const environment = new Environment(interpreter.globals);

    this.declaration.params.forEach((p, i) =>
      environment.define(p.lexeme, args[i])
    );

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
