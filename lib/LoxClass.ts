import { NullableObj } from './@types';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import { LoxInstance } from './LoxInstance.js';

export class LoxClass implements LoxCallable {
  public readonly arity: number = 0;

  constructor(public readonly name: string) {}

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const instance = new LoxInstance(this);
    return instance;
  }

  toString() {
    return this.name;
  }
}
