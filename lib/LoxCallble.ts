import { NullableObj } from './@types';
import { Interpreter } from './Interpreter.js';

export interface LoxCallable {
  readonly arity: number;

  call(interpreter: Interpreter, args: Array<NullableObj>): NullableObj;

  toString(): string;
}

export class Clock implements LoxCallable {
  public readonly arity: number = 0;

  call(_1: Interpreter, _2: Array<NullableObj>): NullableObj {
    return Date.now();
  }

  toString(): string {
    return '<native fn>';
  }
}
