import { LoxClass } from './LoxClass.js';

export class LoxInstance {
  constructor(private readonly klass: LoxClass) {}

  toString() {
    return this.klass.name + ' instance';
  }
}
