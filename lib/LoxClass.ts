import { NullableObj } from './@types';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import { LoxFunction } from './LoxFunction';
import { LoxInstance } from './LoxInstance.js';

export class LoxClass implements LoxCallable {
  public readonly arity: number = 0;

  constructor(
    public readonly name: string,
    public readonly methods: Map<string, LoxFunction>
  ) {}

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const instance = new LoxInstance(this);
    return instance;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) return this.methods.get(name)!;

    return null;
  }

  toString() {
    return this.name;
  }
}
