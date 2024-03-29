import { NullableObj } from './@types';
import { Interpreter } from './Interpreter.js';
import { LoxCallable } from './LoxCallble.js';
import { LoxFunction } from './LoxFunction';
import { LoxInstance } from './LoxInstance.js';

export class LoxClass implements LoxCallable {
  constructor(
    public readonly name: string,
    public readonly superclass: LoxClass | null,
    public readonly methods: Map<string, LoxFunction>
  ) {}

  call(interpreter: Interpreter, args: NullableObj[]): NullableObj {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod('init');
    if (initializer) initializer.bind(instance).call(interpreter, args);
    return instance;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) return this.methods.get(name)!;
    if (this.superclass) return this.superclass.findMethod(name);

    return null;
  }

  toString() {
    return this.name;
  }

  arity(): number {
    const initializer = this.findMethod('init');
    if (!initializer) return 0;
    return initializer.arity();
  }
}
