import { NullableObj } from './@types';
import { Interpreter } from './Interpreter.js';

export interface LoxCallable {
  call(interpreter: Interpreter, args: Array<NullableObj>): NullableObj;

  toString(): string;

  arity(): number;
}

export class Clock implements LoxCallable {
  call(_1: Interpreter, _2: Array<NullableObj>): NullableObj {
    return Date.now();
  }

  toString(): string {
    return '<native fn>';
  }

  arity(): number {
    return 0;
  }
}
